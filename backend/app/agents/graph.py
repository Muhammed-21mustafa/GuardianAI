from typing import TypedDict, Optional, Dict, Any
from langgraph.graph import StateGraph, END
from app.schemas.analysis import ImageAnalysis, VerificationReport
from app.agents.nodes.vision_agent import vision_agent_node
from app.agents.nodes.verification_agent import verification_agent_node
from app.agents.nodes.decision_agent import decision_agent_node
from app.agents.nodes.resolution_agent import resolution_agent_node

# Define Graph State
class AgentState(TypedDict):
    original_image_bytes: bytes
    returned_image_bytes: bytes
    customer_claim: str
    original_analysis: Optional[ImageAnalysis]
    returned_analysis: Optional[ImageAnalysis]
    verification_report: Optional[VerificationReport]
    vision_trace: Optional[str]
    verification_trace: Optional[str]
    decision_trace: Optional[str]
    final_result: Optional[Dict[str, Any]]

# Create Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("vision_agent", vision_agent_node)
workflow.add_node("verification_agent", verification_agent_node)
workflow.add_node("decision_agent", decision_agent_node)
workflow.add_node("resolution_agent", resolution_agent_node)

# Add Edges
workflow.set_entry_point("vision_agent")
workflow.add_edge("vision_agent", "verification_agent")
workflow.add_edge("verification_agent", "decision_agent")
workflow.add_edge("decision_agent", "resolution_agent")
workflow.add_edge("resolution_agent", END)

# Compile Pipeline
guardian_pipeline = workflow.compile()
