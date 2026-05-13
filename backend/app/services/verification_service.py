from app.schemas.analysis import ImageAnalysis, VerificationReport, MismatchItem

class VerificationService:
    @staticmethod
    def compare_analyses(original: ImageAnalysis, returned: ImageAnalysis) -> VerificationReport:
        """
        Compares original shipment image analysis with returned image analysis.
        Generates a mismatch report.
        """
        mismatches = []
        
        # 1. Product Type Mismatch (Critical)
        if original.product_type.lower() not in returned.product_type.lower() and returned.product_type.lower() not in original.product_type.lower():
            mismatches.append(MismatchItem(
                field="product_type",
                original_value=original.product_type,
                returned_value=returned.product_type,
                severity="critical",
                description="The returned product type completely differs from the original."
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
            
        if returned.visible_damage.lower() not in ['none', 'no', 'n/a']:
            mismatches.append(MismatchItem(
                field="visible_damage",
                original_value=original.visible_damage,
                returned_value=returned.visible_damage,
                severity="high",
                description=f"Visible damage detected: {returned.visible_damage}"
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

        return VerificationReport(mismatches=mismatches, overall_severity=overall_severity)

verification_service = VerificationService()
