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
        "critical": "KRİTİK",
        "high": "YÜKSEK",
        "medium": "ORTA",
        "low": "DÜŞÜK"
    }
    case_priority = priority_map.get(risk_level, "DÜŞÜK")
    
    # Status & Operational Outputs
    action_log = []
    marketplace_appeal_draft = "İtiraz raporu oluşturulmasına gerek yoktur."
    customer_response_draft = "İade işleminiz başarıyla onaylanmış ve standart iade politikamız kapsamında işleme alınmıştır."
    
    if risk_level in ["critical", "high"]:
        try:
            from app.services.gemini_service import gemini_service
            import json
            import re
            mismatch_str = "\n".join([f"- {m.field}: {m.description}" for m in report.mismatches])
            prompt = f"""
Sen e-ticaret satıcıları (KOBİ'ler) için çalışan profesyonel bir Hukuk ve Operasyon danışmanısın.
Aşağıdaki vaka için bana iki farklı dilde iletişim taslağı hazırlaman gerekiyor:

1. 'MARKETPLACE APPEAL': Amazon/Trendyol/Hepsiburada gibi bir pazar yerine (Marketplace) sunulmak üzere, son derece resmi ve kanıt odaklı bir iade itiraz (dispute/claim) dilekçesi. Satıcının haklı olduğunu ve para iadesinin bloke edilmesi gerektiğini savunmalı. (Markdown formatında, uzun, detaylı ve çok etkili olsun. 'Sayın Platform Yetkilisi' diye başla).

2. 'CUSTOMER RESPONSE': İadeyi yapan MÜŞTERİYE gönderilecek kibar, nötr ve profesyonel bir mesaj. Asla suçlayıcı (dolandırıcı vb.) olma. Sadece "Görsel doğrulama sonucunda bazı tutarsızlıklar tespit edildiği için iade süreciniz ek/manuel incelemeye aktarılmıştır" gibi politik bir dil kullan.

Vaka Detayları:
Risk Seviyesi: {risk_level.upper()}
Uyuşmazlıklar:
{mismatch_str}

LÜTFEN ÇIKTIYI SADECE AŞAĞIDAKİ GİBİ İKİYE BÖLEREK VER (Araya tam olarak ===CUSTOMER RESPONSE=== yaz):

===MARKETPLACE APPEAL===
[Pazar yeri itiraz dilekçesi metni]

===CUSTOMER RESPONSE===
[Müşteri mesajı metni]
            """
            generated_text = gemini_service.generate_text(prompt)
            
            if "===CUSTOMER RESPONSE===" in generated_text:
                parts = generated_text.split("===CUSTOMER RESPONSE===")
                marketplace_appeal_draft = parts[0].replace("===MARKETPLACE APPEAL===", "").strip()
                customer_response_draft = parts[1].replace("===CUSTOMER RESPONSE===", "").strip()
            else:
                marketplace_appeal_draft = generated_text
                customer_response_draft = "İade süreciniz görsel doğrulama aşamasında takıldığı için manuel incelemeye aktarılmıştır."
                
            dispute_summary = marketplace_appeal_draft # keep for backward compatibility
        except Exception as e:
            dispute_summary = f"GuardianAI sistemi kritik anomaliler tespit etmiştir (Skor: {final_result.get('risk_score')}). Otomatik dilekçe oluşturulamadı. Hata: {str(e)}"
            marketplace_appeal_draft = dispute_summary
            customer_response_draft = "İade işleminiz incelenmektedir."

    if risk_level == "critical":
        case_status = "İNCELEME_İÇİN_BEKLETİLİYOR"
        action_log.extend(["İade işlemi anında bloke edildi", "Mahkemeye/Pazar yerine sunulmak üzere delil paketi oluşturuldu", "Vaka acil olarak operasyon ekibine devredildi"])
        recommended_next_step = "Delil paketini gözden geçirin ve pazaryerine itiraz sürecini başlatın."
        resolution_trace = "Kritik dolandırıcılık tespiti! Vaka üst yönetime iletildi. İtiraz paketi hazırlandı ve iade iptal edildi."
        
    elif risk_level == "high":
        case_status = "AKSİYON_BEKLENİYOR"
        action_log.extend(["İade işlemi askıya alındı", "Süpervizör kontrolü için işaretlendi"])
        recommended_next_step = "Tespit edilen anomalileri fotoğraflardan manuel olarak doğrulayın."
        resolution_trace = "Yüksek anomaliler saptandı. İkincil kontrol için operasyon ekibine iletildi."
        
    elif risk_level == "medium":
        case_status = "RİSK_DEĞERLENDİRİLDİ"
        action_log.extend(["Vakaya 'Potansiyel Risk' bayrağı eklendi", "Standart akış üzerinden işleme devam ediliyor"])
        recommended_next_step = "Operasyonel yoğunluk yoksa manuel inceleme önerilir."
        resolution_trace = "Küçük uyuşmazlıklar loglandı. Operasyonel risk kabul edilebilir seviyede."
        
    else:
        case_status = "KAPATILDI_DÜŞÜK_RİSK"
        action_log.extend(["Otonom görsel doğrulama başarıyla geçti", "Müşterinin para iadesi anında onaylandı"])
        recommended_next_step = "Vakayı arşivle."
        resolution_trace = "Görseller tamamen uyuşuyor. Vaka otomatik olarak çözüldü ve kapatıldı."

    # Evidence Summary
    if len(report.mismatches) == 0:
        evidence_summary = "İade görselleri orijinal sipariş kaydıyla birebir eşleşmektedir."
    else:
        evidence_summary = f"Sistem {len(report.mismatches)} farklı uyuşmazlık tespit etti. Ana Sorun: {report.mismatches[0].description}"

    # Financial Impact
    user_provided_value = state.get("product_value", "").strip()
    if user_provided_value:
        financial_impact = user_provided_value
    else:
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
    final_result["marketplace_appeal_draft"] = marketplace_appeal_draft
    final_result["customer_response_draft"] = customer_response_draft
    final_result["estimated_financial_impact"] = financial_impact
    final_result["thought_trace"] = grand_trace

    return {"final_result": final_result}
