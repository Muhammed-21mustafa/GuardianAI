from typing import Tuple
from app.schemas.analysis import VerificationReport

class RiskService:
    @staticmethod
    def calculate_risk(report: VerificationReport, customer_reason: str = "") -> Tuple[int, str, bool]:
        """
        Calculates risk score (0-100) and risk level based on the verification report.
        Uses a weighted scoring system for granular risk assessment.
        Returns: (risk_score, risk_level, inconsistency_detected)
        """
        score = 0
        is_completely_different_product = False
        
        mismatch_fields = []
        # Weighted points by field
        for mismatch in report.mismatches:
            mismatch_fields.append(mismatch.field)
            if mismatch.severity == "critical":
                is_completely_different_product = True
                break
                
            if mismatch.field == "product_type":
                score += 70
            elif mismatch.field == "condition":
                score += 25
            elif mismatch.field == "color":
                score += 25
            elif mismatch.field == "visible_damage":
                score += 20
            elif mismatch.field == "accessories":
                score += 15
            elif mismatch.field == "packaging_status":
                score += 10
            elif mismatch.field == "label_status":
                score += 10
            else:
                # Fallback for unexpected fields based on severity
                if mismatch.severity == "high":
                    score += 30
                elif mismatch.severity == "medium":
                    score += 15
                elif mismatch.severity == "low":
                    score += 5
        
        # Apply logic for customer claim
        inconsistency_detected = False
        if not is_completely_different_product and customer_reason:
            reason_lower = customer_reason.lower()
            is_objective_damage = any(word in reason_lower for word in ["hasarlı", "kusurlu", "çalışmıyor", "damaged", "defective", "broken"])
            is_objective_missing = any(word in reason_lower for word in ["eksik", "yanlış", "missing", "wrong"])
            
            # "Hasarlı geldi" dedi ama ürün sağlam görünüyorsa -> risk medium (+30)
            if is_objective_damage and "visible_damage" not in mismatch_fields and "condition" not in mismatch_fields:
                score += 30
                inconsistency_detected = True
                
            # "Eksik parça" dedi ama görselde parça tam görünüyorsa -> risk medium (+30)
            if is_objective_missing and "accessories" not in mismatch_fields and "product_type" not in mismatch_fields:
                score += 30
                inconsistency_detected = True
                
        if is_completely_different_product:
            score = 100
        else:
            # Cap score at 99 if not completely different
            score = min(score, 99)
        
        # Determine risk level based on new thresholds
        if score <= 25:
            level = "low"
        elif score <= 60:
            level = "medium"
        elif score <= 85:
            level = "high"
        else:
            level = "critical"
            
        return score, level, inconsistency_detected

    @staticmethod
    def determine_action(risk_level: str) -> Tuple[str, bool]:
        """
        Determines the recommended action and if manual review is needed.
        Returns: (recommended_action, manual_review_required)
        """
        if risk_level == "low":
            return "İadeyi Onayla", False
        elif risk_level == "medium":
            return "Uyarı: İadeyi İncelemeye Al", True
        elif risk_level == "high":
            return "İadeyi Beklet, Manuel Kontrol Gerekiyor", True
        elif risk_level == "critical":
            return "İadeyi Bloke Et, İtiraz Raporu Oluştur", True
            
        return "Manuel İnceleme", True

risk_service = RiskService()
