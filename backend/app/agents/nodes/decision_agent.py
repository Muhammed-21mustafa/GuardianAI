from app.services.risk_service import risk_service

def decision_agent_node(state: dict) -> dict:
    """
    Node 3: The Decision Agent. Evaluates the verification report and calculates risk.
    """
    report = state.get("verification_report")
    orig_analysis = state.get("original_analysis")
    ret_analysis = state.get("returned_analysis")
    
    order_desc = state.get("order_description", "")
    reason = state.get("customer_return_reason", "")

    # Calculate risk score and action
    risk_score, risk_level, inconsistency = risk_service.calculate_risk(report, reason)
    recommended_action, manual_review = risk_service.determine_action(risk_level)

    # Contextual adjustments for subjective vs objective
    reason_lower = reason.lower()
    is_subjective = any(word in reason_lower for word in ["beden", "rahatsız", "beklentimi", "fikrimi", "size", "uncomfortable", "expect", "liked", "changed", "fit"])

    # Generate Thought Trace (Reasoning)
    mismatch_fields = [m.field for m in report.mismatches]
    context_str = f"Sipariş: '{order_desc}'. Müşteri Sebebi: '{reason}'." if order_desc or reason else ""

    if inconsistency and len(mismatch_fields) == 0:
        thought_trace = f"Görsel bir uyumsuzluk bulunmadı, ancak müşteri beyanıyla (ör. hasar/eksik iddiası) görsel kanıt çelişiyor. {context_str} Durum şüpheli olduğu için manuel inceleme önerilir."
        summary = "Müşteri Beyanı ile Görsel Kanıt Çelişkisi"
    elif risk_score == 0:
        thought_trace = f"Görsel olarak hiçbir uyumsuzluk bulunmadı. {context_str} Müşteri beyanı güvenli iade koşullarıyla uyuşuyor. Onaylandı."
        summary = "İade orijinal ürünle tam eşleşiyor"
    elif risk_level in ["high", "critical"]:
        thought_trace = f"Şu alanlarda yüksek riskli uyumsuzluk tespit edildi: {', '.join(mismatch_fields)}. {context_str} Görsel deliller, kabul edilebilir iade koşullarıyla kesinlikle çelişiyor. Risk skoru kritik seviyeye yükseltildi."
        summary = "Yüksek Dolandırıcılık İhtimali veya Ağır Hasar"
    else:
        if is_subjective:
            thought_trace = f"Şu alanlarda küçük tutarsızlıklar tespit edildi: {', '.join(mismatch_fields)}. {context_str} Müşterinin iade sebebi subjektif olduğu için görseldeki küçük hatalar normal kullanım yıpranması olabilir. Risk skoru suni olarak artırılmadı."
        else:
            thought_trace = f"Şu alanlarda küçük tutarsızlıklar tespit edildi: {', '.join(mismatch_fields)}. {context_str} Kabul edilebilirliğini doğrulamak için manuel inceleme gerekmektedir."
        summary = "Potansiyel Yıpranma veya Küçük Hata"

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
