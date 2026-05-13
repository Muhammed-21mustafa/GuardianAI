from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.agents.graph import app_graph

router = APIRouter()

class AnalysisRequest(BaseModel):
    case_id: str
    original_product_info: str
    return_image_data: str

class AnalysisResponse(BaseModel):
    case_id: str
    fraud_score: float
    analysis_reasoning: str
    action_taken: str
    report_draft: str

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_return(request: AnalysisRequest):
    """
    Starts the agentic pipeline to analyze a return case.
    """
    try:
        # Initial state for LangGraph
        initial_state = {
            "case_id": request.case_id,
            "original_product_info": request.original_product_info,
            "return_image_data": request.return_image_data
        }
        
        # Run the graph
        # For LangGraph 0.1.x, invoke() is typically used. 
        # Using a simple synchronous invoke for MVP.
        final_state = app_graph.invoke(initial_state)
        
        return AnalysisResponse(
            case_id=final_state.get("case_id"),
            fraud_score=final_state.get("fraud_score", 0.0),
            analysis_reasoning=final_state.get("analysis_reasoning", ""),
            action_taken=final_state.get("action_taken", ""),
            report_draft=final_state.get("report_draft", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
