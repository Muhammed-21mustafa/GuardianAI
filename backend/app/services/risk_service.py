from typing import Tuple
from app.schemas.analysis import VerificationReport

class RiskService:
    @staticmethod
    def calculate_risk(report: VerificationReport) -> Tuple[int, str]:
        """
        Calculates risk score (0-100) and risk level based on the verification report.
        Returns: (risk_score, risk_level)
        """
        score = 0
        
        # Base points by severity count
        has_critical = False
        for mismatch in report.mismatches:
            if mismatch.severity == "critical":
                has_critical = True
                score += 50
            elif mismatch.severity == "high":
                score += 30
            elif mismatch.severity == "medium":
                score += 15
            elif mismatch.severity == "low":
                score += 5
                
        if has_critical:
            score = 100
        else:
            # Cap score at 100
            score = min(score, 100)
        
        # Determine risk level
        if score == 0:
            level = "low"
        elif score < 40:
            level = "low"
        elif score < 70:
            level = "medium"
        elif score < 90:
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
