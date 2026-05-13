export interface Mismatch {
    field: string;
    original_value: string;
    returned_value: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
}

export interface AnalysisResponse {
    risk_score: number;
    risk_level: "low" | "medium" | "high" | "critical";
    summary: string;
    mismatches: Mismatch[];
    recommended_action: string;
    confidence: number;
    manual_review_required: boolean;
    thought_trace: string;
}
