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
    case_id: string;
    case_status: string;
    case_priority: string;
    evidence_summary: string;
    automated_action_log: string[];
    recommended_next_step: string;
    dispute_report_summary: string;
    marketplace_appeal_draft: string;
    customer_response_draft: string;
    reason_codes: string[];
    estimated_financial_impact: string;
    semantic_verification?: Record<string, unknown> | null;
}

export interface CaseImageUrls {
    original?: string;
    returned?: string;
}

export interface CaseRecord {
    id: string;
    product_name: string;
    risk_score: number;
    status: string;
    agent_data: AnalysisResponse;
    image_urls?: CaseImageUrls;
    created_at: string;
}
