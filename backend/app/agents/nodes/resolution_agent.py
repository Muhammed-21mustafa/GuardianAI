import uuid
import datetime

def get_financial_impact(product_type: str) -> str:
    """Heuristic for estimated financial impact."""
    pt = product_type.lower()
    if "iphone" in pt or "phone" in pt or "smartphone" in pt:
        return "$1,200"
    elif "laptop" in pt or "macbook" in pt:
        return "$1,500"
    elif "headphone" in pt or "airpods" in pt:
        return "$250"
    elif "clothing" in pt or "shirt" in pt or "dress" in pt:
        return "$80"
    return "$100"

def resolution_agent_node(state: dict) -> dict:
    """
    Node 4: The Resolution Agent. 
    Transforms the AI decision into an Enterprise Case Management payload.
    """
    final_result = state.get("final_result", {})
    orig_analysis = state.get("original_analysis")
    report = state.get("verification_report")
    
    risk_level = final_result.get("risk_level", "low")
    
    # 1. Case Meta
    case_id = f"GA-{uuid.uuid4().hex[:6].upper()}"
    
    # Priority
    priority_map = {
        "critical": "CRITICAL",
        "high": "HIGH",
        "medium": "MEDIUM",
        "low": "LOW"
    }
    case_priority = priority_map.get(risk_level, "LOW")
    
    # Status & Operational Outputs
    action_log = []
    dispute_summary = "No dispute report required."
    
    if risk_level == "critical":
        case_status = "ESCALATED_FOR_REVIEW"
        action_log.extend(["Refund temporarily suspended", "Evidence package generated", "Case escalated to manual operations team"])
        dispute_summary = f"Automated AI detection confirmed critical anomalies (Score: {final_result.get('risk_score')}). The returned item is substantially different or manipulated. Refund is blocked."
        recommended_next_step = "Review evidence package and submit dispute to marketplace."
        resolution_trace = "Case escalated. Dispute package prepared and refund blocked."
        
    elif risk_level == "high":
        case_status = "ACTION_REQUIRED"
        action_log.extend(["Refund put on hold", "Flagged for supervisor review"])
        dispute_summary = "High risk of fraud or damage detected. Requires human verification before proceeding."
        recommended_next_step = "Verify mismatches manually."
        resolution_trace = "High anomalies detected. Passed to operations for secondary check."
        
    elif risk_level == "medium":
        case_status = "RISK_EVALUATED"
        action_log.extend(["Warning flag attached to case", "Proceeding with standard flow"])
        recommended_next_step = "Optional manual review if volume permits."
        resolution_trace = "Minor discrepancies logged. Operational risk acceptable."
        
    else:
        case_status = "CLOSED_LOW_RISK"
        action_log.extend(["Automated validation passed", "Refund approved"])
        recommended_next_step = "Archive case."
        resolution_trace = "Clear match. Auto-resolved and closed."

    # Evidence Summary
    if len(report.mismatches) == 0:
        evidence_summary = "Images perfectly match the original shipment."
    else:
        evidence_summary = f"Detected {len(report.mismatches)} discrepancies. Primary issue: {report.mismatches[0].description}"

    # Financial Impact
    financial_impact = get_financial_impact(orig_analysis.product_type) if orig_analysis else "$100"

    # Multi-Agent Thought Trace
    vision_trace = state.get("vision_trace", "Vision analysis completed.")
    verification_trace = state.get("verification_trace", "Verification completed.")
    decision_trace = state.get("decision_trace", "Decision rendered.")
    
    grand_trace = (
        f"VISION AGENT:\n{vision_trace}\n\n"
        f"VERIFICATION AGENT:\n{verification_trace}\n\n"
        f"DECISION AGENT:\n{decision_trace}\n\n"
        f"RESOLUTION AGENT:\n{resolution_trace}"
    )
    
    # Update final result
    final_result["case_id"] = case_id
    final_result["case_status"] = case_status
    final_result["case_priority"] = case_priority
    final_result["evidence_summary"] = evidence_summary
    final_result["automated_action_log"] = action_log
    final_result["recommended_next_step"] = recommended_next_step
    final_result["dispute_report_summary"] = dispute_summary
    final_result["estimated_financial_impact"] = financial_impact
    final_result["thought_trace"] = grand_trace

    return {"final_result": final_result}
