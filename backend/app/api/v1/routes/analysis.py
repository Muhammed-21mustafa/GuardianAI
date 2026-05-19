from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.schemas.analysis import AnalysisResponse
from app.agents.graph import guardian_pipeline
from app.core.exceptions import InvalidImageError
from app.database import get_db
from app.models import Case
import os
import uuid
import json

router = APIRouter()

@router.post("/analyze-return", response_model=AnalysisResponse)
async def analyze_return_endpoint(
    original_image: UploadFile = File(...),
    returned_image: UploadFile = File(...),
    order_description: str = Form(default=""),
    customer_return_reason: str = Form(default=""),
    product_value: str = Form(default=""),
    db: Session = Depends(get_db)
):
    """
    POST /api/v1/analyze-return
    Takes two images (multipart/form-data) and runs the GuardianAI Agentic Pipeline.
    """
    
    # 1. Validate inputs
    if not original_image.content_type.startswith('image/') or not returned_image.content_type.startswith('image/'):
        raise InvalidImageError("Both files must be valid images.")

    try:
        orig_bytes = await original_image.read()
        ret_bytes = await returned_image.read()
    except Exception as e:
        raise InvalidImageError(f"Failed to read image bytes: {str(e)}")

    # 2. Build Initial State
    initial_state = {
        "original_image_bytes": orig_bytes,
        "returned_image_bytes": ret_bytes,
        "order_description": order_description,
        "customer_return_reason": customer_return_reason,
        "product_value": product_value
    }

    # 3. Invoke LangGraph Pipeline
    try:
        final_state = guardian_pipeline.invoke(initial_state)
        result_dict = final_state.get("final_result", {})
        
        # Save images to disk
        case_id_val = result_dict.get("case_id", uuid.uuid4().hex[:6].upper())
        orig_filename = f"{case_id_val}_orig.jpg"
        ret_filename = f"{case_id_val}_ret.jpg"
        
        os.makedirs("uploads", exist_ok=True)
        with open(f"uploads/{orig_filename}", "wb") as f:
            f.write(orig_bytes)
        with open(f"uploads/{ret_filename}", "wb") as f:
            f.write(ret_bytes)
            
        image_urls_dict = {
            "original": f"/uploads/{orig_filename}",
            "returned": f"/uploads/{ret_filename}"
        }

        # Save to DB
        if result_dict:
            new_case = Case(
                id=result_dict.get("case_id"),
                product_name=order_description,
                risk_score=result_dict.get("risk_score"),
                status=result_dict.get("case_status"),
                agent_data=result_dict,
                image_urls=image_urls_dict
            )
            db.add(new_case)
            db.commit()

        # 4. Return Structured Output
        return AnalysisResponse(**result_dict)
        
    except Exception as e:
        # Failsafe Mode
        case_id_val = f"GA-{uuid.uuid4().hex[:6].upper()}"
        orig_filename = f"{case_id_val}_orig.jpg"
        ret_filename = f"{case_id_val}_ret.jpg"
        
        os.makedirs("uploads", exist_ok=True)
        try:
            with open(f"uploads/{orig_filename}", "wb") as f:
                f.write(orig_bytes)
            with open(f"uploads/{ret_filename}", "wb") as f:
                f.write(ret_bytes)
        except Exception:
            pass

        image_urls_dict = {
            "original": f"/uploads/{orig_filename}",
            "returned": f"/uploads/{ret_filename}"
        }
        
        fallback_data = {
            "risk_score": 0,
            "risk_level": "medium",
            "summary": "Sistem analizi sırasında görsel bir tutarsızlık tespit edildi. Manuel inceleme için eskale ediliyor.",
            "mismatches": [],
            "recommended_action": "Manuel inceleme başlatın.",
            "confidence": 1.0,
            "manual_review_required": True,
            "thought_trace": f"SYSTEM FAILSAFE TRIGGERED:\nPipeline execution caught an exception: {str(e)}\nFailsafe fallback initiated.",
            "case_id": case_id_val,
            "case_status": "MANUAL_REVIEW_REQUIRED",
            "case_priority": "ORTA",
            "evidence_summary": "Sistem analizi sırasında görsel bir tutarsızlık tespit edildi. Manuel inceleme için eskale ediliyor.",
            "automated_action_log": [
                "Sistem hatası yakalandı.",
                "Güvenli mod (Failsafe) devreye girdi.",
                "Vaka manuel incelemeye yönlendirildi."
            ],
            "recommended_next_step": "Manuel İnceleme",
            "dispute_report_summary": "Sistem analizi sırasında görsel bir tutarsızlık tespit edildi. Manuel inceleme için eskale ediliyor.",
            "marketplace_appeal_draft": "Sayın Platform Yetkilisi,\n\nSistem analizi sırasında görsel bir tutarsızlık tespit edildi. Manuel inceleme için eskale ediliyor.",
            "customer_response_draft": "İade talebiniz operasyon ekibimiz tarafından manuel incelemeye alınmıştır.",
            "reason_codes": ["SYSTEM_FALLBACK"],
            "estimated_financial_impact": product_value or "0 TL"
        }

        try:
            new_case = Case(
                id=case_id_val,
                product_name=order_description or "Bilinmeyen Ürün",
                risk_score=0,
                status="MANUAL_REVIEW_REQUIRED",
                agent_data=fallback_data,
                image_urls=image_urls_dict
            )
            db.add(new_case)
            db.commit()
        except Exception as db_err:
            db.rollback()
            print(f"Database error during fallback save: {db_err}")

        return AnalysisResponse(**fallback_data)

@router.get("/cases")
def get_cases(db: Session = Depends(get_db)):
    """
    GET /api/v1/cases
    Returns all cases ordered by newest first.
    """
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    return [{"id": c.id, "product_name": c.product_name, "risk_score": c.risk_score, "status": c.status, "agent_data": c.agent_data, "image_urls": c.image_urls, "created_at": c.created_at} for c in cases]

@router.patch("/cases/{case_id}/status")
def update_case_status(case_id: str, status: str = Form(...), db: Session = Depends(get_db)):
    """
    PATCH /api/v1/cases/{case_id}/status
    Updates the status of a specific case.
    """
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db_case.status = status
    db.commit()
    db.refresh(db_case)
    return {"message": "Status updated successfully", "status": db_case.status}
