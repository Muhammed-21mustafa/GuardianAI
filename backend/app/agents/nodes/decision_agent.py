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

    is_customer_claiming_damage = any(word in reason_lower for word in ["hasar", "kusur", "darbe", "çizik", "kırık", "bozuk", "damaged", "defective", "broken"])
    has_damage_mismatch = any(m.field in ["condition", "visible_damage"] for m in report.mismatches)

    if inconsistency and len(mismatch_fields) == 0:
        thought_trace = f"[Beyan Tutarsızlığı] Görsel bir uyumsuzluk bulunmadı, ancak müşteri '{reason}' diyerek farklı bir durum belirtmiş. İade politikası gereği operasyonel eskalasyon önerilir. Aksiyon: Manuel İnceleme."
        summary = "Operasyonel Öneri: Beyan ve Kanıt Çelişkisi"
    elif is_customer_claiming_damage and has_damage_mismatch and risk_score < 50:
        thought_trace = f"[Taşıma Hasarı Doğrulaması] Müşteri iade sebebi olarak hasar bildirmiş ve görsel analiz bunu destekliyor. Kargo veya depo sürecinde oluşmuş olası hasar. Aksiyon: Müşteri iadesi onaylanabilir, taşıyıcı için operasyonel kanıt özeti hazırlandı."
        summary = "Operasyonel Öneri: Hasar Doğrulandı (Taşıyıcı İncelemesi)"
    elif risk_score == 0:
        thought_trace = f"[Uyumlu İade] Görsel analizde uyumsuzluk saptanmadı. Müşteri beyanı beklenen koşullarla örtüşüyor. Aksiyon: İade onay sürecine alınabilir."
        summary = "Operasyonel Öneri: Doğrulanmış İade (Onay Önerisi)"
    elif risk_level in ["high", "critical"]:
        thought_trace = f"[Kritik Doğrulama Anomalisi] Tespit edilen tutarsızlıklar: {', '.join(mismatch_fields)}. Görsel veriler, beklenen ürün profiliyle ciddi düzeyde çelişmektedir. Aksiyon: İşlem geçici olarak durduruldu, manuel operasyonel incelemeye eskale edilecek."
        summary = "Operasyonel Öneri: Yüksek Riskli Tutarsızlık (Eskalasyon)"
    else:
        if is_subjective:
            thought_trace = f"[Olası Yıpranma/Değer Kaybı] Tutarsızlıklar: {', '.join(mismatch_fields)}. Müşteri beyanı subjektif ('{reason}'). Üründe tespit edilen minör bulgular, değer kaybı ihtimali yaratmaktadır. Aksiyon: Kondisyon kontrolü için depoda manuel inceleme."
        else:
            thought_trace = f"[Kısmi Uyumsuzluk] Tutarsızlıklar: {', '.join(mismatch_fields)}. {context_str} İade standartlarında sapmalar mevcut. Aksiyon: Operasyonel inceleme ve potansiyel kısmi iade değerlendirmesi."
        summary = "Operasyonel Öneri: Minör Tutarsızlık (Depo İncelemesi)"

    # Calculate overall confidence based on vision analysis confidence
    overall_confidence = (orig_analysis.confidence + ret_analysis.confidence) / 2.0

    # Generate Reason Codes
    reason_codes = []
    if "product_type" in mismatch_fields:
        reason_codes.append("ITEM_SWAP")
    if "accessories" in mismatch_fields:
        reason_codes.append("MISSING_ACCESSORY")
    if inconsistency:
        reason_codes.append("CLAIM_MISMATCH")
    if is_subjective:
        reason_codes.append("SUBJECTIVE_RETURN")
    if risk_level == "critical":
        reason_codes.append("CRITICAL_VERIFICATION_RISK")
    if risk_score == 0:
        reason_codes.append("CLEAN_RETURN")

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
            "reason_codes": reason_codes,
            "thought_trace": "",
            "semantic_verification": report.semantic_verification
        }
    }
