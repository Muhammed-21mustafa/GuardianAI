from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- Vision Analysis Schemas ---
class ImageAnalysis(BaseModel):
    product_type: str = Field(description="Detected type of product")
    color: str = Field(description="Dominant color of the product")
    condition: str = Field(description="Overall condition (e.g., 'new', 'used', 'damaged')")
    visible_damage: str = Field(description="Any visible damage description. 'None' if intact.")
    label_status: str = Field(description="Status of shipping/return label (e.g., 'present', 'missing', 'damaged')")
    packaging_status: str = Field(description="Status of packaging (e.g., 'sealed', 'opened', 'damaged box')")
    accessories: str = Field(description="Visible accessories or 'None'")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0", ge=0.0, le=1.0)

# --- Verification Schemas ---
class MismatchItem(BaseModel):
    field: str
    original_value: str
    returned_value: str
    severity: Literal["low", "medium", "high", "critical"]
    description: str

class VerificationReport(BaseModel):
    mismatches: List[MismatchItem]
    overall_severity: Literal["none", "low", "medium", "high", "critical"]

# --- Final Output Schema ---
class AnalysisResponse(BaseModel):
    risk_score: int = Field(description="Risk score between 0 and 100", ge=0, le=100)
    risk_level: Literal["low", "medium", "high", "critical"]
    summary: str = Field(description="Brief summary of the decision")
    mismatches: List[dict] = Field(description="List of detected mismatches")
    recommended_action: str = Field(description="Recommended action for the merchant")
    confidence: float = Field(description="Overall confidence in the decision", ge=0.0, le=1.0)
    manual_review_required: bool = Field(description="Flag indicating if a human should review")
    thought_trace: str = Field(description="AI's reasoning chain")
