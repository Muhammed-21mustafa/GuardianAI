from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, END
import google.generativeai as genai
from app.core.config import settings

# Initialize Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
# We will use gemini-1.5-pro for reasoning
model = genai.GenerativeModel('gemini-1.5-pro')

# 1. Define State
class AgentState(TypedDict):
    case_id: str
    original_product_info: str
    return_image_data: str # Base64 or URL
    fraud_score: Optional[float]
    analysis_reasoning: Optional[str]
    action_taken: Optional[str]
    report_draft: Optional[str]

# 2. Define Nodes
def detection_node(state: AgentState):
    """Analyzes the image and basic info (Replaces YOLO for MVP)."""
    print(f"--- DETECTING IMAGE FOR CASE {state['case_id']} ---")
    # In a real scenario, we send image + text to Gemini Vision
    return {"case_id": state["case_id"]}

def reasoning_node(state: AgentState):
    """Calculates fraud score and generates reasoning."""
    print("--- REASONING: CALCULATING FRAUD SCORE ---")
    # Mocking Gemini response for now
    # prompt = f"Compare original {state['original_product_info']} with return image..."
    # response = model.generate_content(prompt)
    return {"fraud_score": 0.85, "analysis_reasoning": "High probability of empty box return."}

def action_node(state: AgentState):
    """Takes action based on the fraud score."""
    print("--- ACTION: GENERATING REPORT AND SUSPENDING REFUND ---")
    if state.get("fraud_score", 0) > 0.7:
         action = "Refund Suspended"
         draft = "Dilekçe: İşbu iade talebinde ürün kutusu boş gönderilmiştir..."
    else:
         action = "Refund Approved"
         draft = "No report needed."
    return {"action_taken": action, "report_draft": draft}

# 3. Define Conditional Edges
def route_action(state: AgentState):
    if state.get("fraud_score", 0) > 0.7:
        return "action"
    return "end"

# 4. Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("detection", detection_node)
workflow.add_node("reasoning", reasoning_node)
workflow.add_node("action", action_node)

workflow.set_entry_point("detection")
workflow.add_edge("detection", "reasoning")
workflow.add_conditional_edges(
    "reasoning",
    route_action,
    {
        "action": "action",
        "end": END
    }
)
workflow.add_edge("action", END)

# Compile
app_graph = workflow.compile()
