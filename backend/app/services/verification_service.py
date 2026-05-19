from app.schemas.analysis import ImageAnalysis, VerificationReport, MismatchItem
from app.services.gemini_service import gemini_service

class VerificationService:
    @staticmethod
    def compare_analyses(original: ImageAnalysis, returned: ImageAnalysis) -> VerificationReport:
        """
        Compares original shipment image analysis with returned image analysis.
        Generates a mismatch report using both basic rules and a Semantic AI check.
        """
        mismatches = []
        
        # 0. Get Semantic Verification from LLM
        semantic_data = gemini_service.semantic_verification(
            orig_pt=original.product_type,
            ret_pt=returned.product_type,
            orig_dmg=original.visible_damage,
            ret_dmg=returned.visible_damage
        )
        
        p_match = semantic_data.get("product_match", {})
        d_match = semantic_data.get("damage_match", {})
        
        same_category = p_match.get("same_category", False)
        category_distance = p_match.get("category_distance", "different")
        p_confidence = p_match.get("confidence", 0.0)
        
        is_new_damage = d_match.get("is_new_damage", False)
        d_confidence = d_match.get("confidence", 0.0)

        # 1. Product Type Mismatch (Critical)
        if not same_category and category_distance == "different" and p_confidence >= 0.75:
            mismatches.append(MismatchItem(
                field="product_type",
                original_value=original.product_type,
                returned_value=returned.product_type,
                severity="critical",
                description=f"Semantic Mismatch: {p_match.get('explanation', 'Item completely differs.')}"
            ))
        elif not same_category and p_confidence < 0.75:
            # Ambiguous
            mismatches.append(MismatchItem(
                field="product_type",
                original_value=original.product_type,
                returned_value=returned.product_type,
                severity="medium",
                description=f"Ambiguous Product Type: {p_match.get('explanation', 'Unable to confidently match.')}"
            ))

        # 2. Condition & Damage Mismatch
        if returned.condition.lower() in ['damaged', 'used'] and original.condition.lower() in ['new', 'perfect']:
            mismatches.append(MismatchItem(
                field="condition",
                original_value=original.condition,
                returned_value=returned.condition,
                severity="high",
                description=f"Product condition changed from {original.condition} to {returned.condition}."
            ))
            
        if is_new_damage:
            severity = "medium" if d_confidence < 0.8 else "high"
            mismatches.append(MismatchItem(
                field="visible_damage",
                original_value=original.visible_damage,
                returned_value=returned.visible_damage,
                severity=severity,
                description=f"New damage detected: {d_match.get('explanation', returned.visible_damage)}"
            ))

        # 3. Packaging & Accessories Mismatch
        if original.packaging_status.lower() == 'sealed' and returned.packaging_status.lower() != 'sealed':
            mismatches.append(MismatchItem(
                field="packaging_status",
                original_value=original.packaging_status,
                returned_value=returned.packaging_status,
                severity="medium",
                description="Packaging seal is broken."
            ))

        if original.accessories.lower() != 'none' and returned.accessories.lower() in ['none', 'missing']:
            mismatches.append(MismatchItem(
                field="accessories",
                original_value=original.accessories,
                returned_value=returned.accessories,
                severity="high",
                description="Original accessories are missing in the returned package."
            ))

        # Determine overall severity
        overall_severity = "none"
        if any(m.severity == "critical" for m in mismatches):
            overall_severity = "critical"
        elif any(m.severity == "high" for m in mismatches):
            overall_severity = "high"
        elif any(m.severity == "medium" for m in mismatches):
            overall_severity = "medium"
        elif mismatches:
            overall_severity = "low"

        return VerificationReport(
            mismatches=mismatches, 
            overall_severity=overall_severity,
            semantic_verification=semantic_data
        )

verification_service = VerificationService()
