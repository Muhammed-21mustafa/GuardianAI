from app.services.verification_service import verification_service

def verification_agent_node(state: dict) -> dict:
    """
    Node 2: Compares the extracted features from Vision node and generates a mismatch report.
    """
    orig_analysis = state.get("original_analysis")
    ret_analysis = state.get("returned_analysis")
    
    # Run comparison logic
    report = verification_service.compare_analyses(orig_analysis, ret_analysis)
    
    # Create trace
    mismatch_count = len(report.mismatches)
    trace = f"Compared analyses. Found {mismatch_count} discrepancies. Overall severity: {report.overall_severity.upper()}."

    return {
        "verification_report": report,
        "verification_trace": trace
    }
