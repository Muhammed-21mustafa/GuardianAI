from app.services.risk_service import risk_service

def decision_agent_node(state: dict) -> dict:
    """
    Node 3: The Decision Agent. Evaluates the verification report and calculates risk.
    """
    report = state.get("verification_report")
    orig_analysis = state.get("original_analysis")
    ret_analysis = state.get("returned_analysis")
    customer_claim = state.get("customer_claim", "")

    # Calculate risk score and action
    risk_score, risk_level = risk_service.calculate_risk(report)
    recommended_action, manual_review = risk_service.determine_action(risk_level)

    # Generate Thought Trace (Reasoning)
    mismatch_fields = [m.field for m in report.mismatches]
    
    if risk_score == 0:
        thought_trace = f"No discrepancies found. Customer claim '{customer_claim}' aligns with the verified flawless condition. Approved."
        summary = "Return matches original shipment"
    elif risk_level in ["high", "critical"]:
        thought_trace = f"Detected high-risk mismatches in: {', '.join(mismatch_fields)}. Customer claimed: '{customer_claim}'. The visual evidence strongly contradicts acceptable return conditions. Risk score elevated."
        summary = "High Fraud Probability or Severe Damage"
    else:
        thought_trace = f"Detected minor inconsistencies in {', '.join(mismatch_fields)}. Customer claimed: '{customer_claim}'. Requires human eyes to confirm acceptability."
        summary = "Potential Wear/Tear or Minor Issue"

    # Calculate overall confidence based on vision analysis confidence
    overall_confidence = (orig_analysis.confidence + ret_analysis.confidence) / 2.0

    return {
        "decision_trace": thought_trace,
        "final_result": {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "summary": summary,
            "mismatches": [m.model_dump() for m in report.mismatches],
            "recommended_action": recommended_action,
            "confidence": overall_confidence,
            "manual_review_required": manual_review,
            # thought_trace will be built by ResolutionAgent
            "thought_trace": "" 
        }
    }
