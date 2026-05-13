from app.services.risk_service import risk_service

def decision_agent_node(state: dict) -> dict:
    """
    Node 3: Calculates final risk score, determines actions, and formulates thought trace.
    """
    report = state.get("verification_report")
    orig_analysis = state.get("original_analysis")
    ret_analysis = state.get("returned_analysis")
    
    # 1. Calculate Risk
    risk_score, risk_level = risk_service.calculate_risk(report)
    
    # 2. Determine Action
    recommended_action, manual_review = risk_service.determine_action(risk_level)
    
    # 3. Generate Thought Trace (Reasoning Chain)
    mismatch_fields = [m.field for m in report.mismatches]
    
    if risk_score == 0:
        thought_trace = "Images matched perfectly. No discrepancies found in condition or product type. Safe to proceed."
        summary = "Clear Match"
    elif risk_level in ["high", "critical"]:
        critical_desc = next((m.description for m in report.mismatches if m.severity == "critical"), "Significant discrepancies detected.")
        thought_trace = f"Detected high-risk mismatches in: {', '.join(mismatch_fields)}. {critical_desc} Risk score elevated due to critical mismatch findings."
        summary = "High Fraud Probability"
    else:
        thought_trace = f"Detected minor inconsistencies in {', '.join(mismatch_fields)}. Requires human eyes to confirm acceptability."
        summary = "Potential Wear/Tear or Minor Issue"

    # Calculate overall confidence based on vision analysis confidence
    overall_confidence = (orig_analysis.confidence + ret_analysis.confidence) / 2.0

    return {
        "final_result": {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "summary": summary,
            "mismatches": [m.model_dump() for m in report.mismatches],
            "recommended_action": recommended_action,
            "confidence": overall_confidence,
            "manual_review_required": manual_review,
            "thought_trace": thought_trace
        }
    }
