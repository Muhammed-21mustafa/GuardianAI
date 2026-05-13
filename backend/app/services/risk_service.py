from typing import Tuple
from app.schemas.analysis import VerificationReport

class RiskService:
    @staticmethod
    def calculate_risk(report: VerificationReport) -> Tuple[int, str]:
        """
        Calculates risk score (0-100) and risk level based on the verification report.
        Uses a weighted scoring system for granular risk assessment.
        Returns: (risk_score, risk_level)
        """
        score = 0
        is_completely_different_product = False
        
        # Weighted points by field
        for mismatch in report.mismatches:
            if mismatch.field == "product_type":
                if mismatch.severity == "critical":
                    is_completely_different_product = True
                else:
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
                
        if is_completely_different_product:
            score = 100
        else:
            # Cap score at 100
            score = min(score, 100)
        
        # Determine risk level based on new thresholds
        if score <= 25:
            level = "low"
        elif score <= 60:
            level = "medium"
        elif score <= 85:
            level = "high"
        else:
            level = "critical"
            
        return score, level

    @staticmethod
    def determine_action(risk_level: str) -> Tuple[str, bool]:
        """
        Determines the recommended action and if manual review is needed.
        Returns: (recommended_action, manual_review_required)
        """
        if risk_level == "low":
            return "Approve Return", False
        elif risk_level == "medium":
            return "Flag for Warning, Proceed with Caution", True
        elif risk_level == "high":
            return "Suspend Refund, Request Manual Review", True
        elif risk_level == "critical":
            return "Block Refund, Auto-Generate Dispute Report", True
            
        return "Manual Review", True

risk_service = RiskService()
