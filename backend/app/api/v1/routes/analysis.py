from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from app.schemas.analysis import AnalysisResponse
from app.agents.graph import guardian_pipeline
from app.core.exceptions import InvalidImageError

router = APIRouter()

@router.post("/analyze-return", response_model=AnalysisResponse)
async def analyze_return_endpoint(
    original_image: UploadFile = File(...),
    returned_image: UploadFile = File(...),
    order_description: str = Form(default=""),
    customer_return_reason: str = Form(default=""),
    product_value: str = Form(default="")
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
        
        # 4. Return Structured Output
        return AnalysisResponse(**result_dict)
        
    except Exception as e:
        # Pass exception to centralized handler
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")
