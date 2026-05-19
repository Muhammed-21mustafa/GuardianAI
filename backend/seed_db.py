import sys
import os
import random
from datetime import datetime, timedelta

# Ensure we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import Case

def seed_data():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    cases = [
        {"id": "GA-7A1B2", "product": "iPhone 15 Pro Max 256GB", "risk": 99, "status": "İADE_REDDEDİLDİ_BLOKE"},
        {"id": "GA-8C3D4", "product": "Sony WH-1000XM5 Kulaklık", "risk": 12, "status": "İADE_ONAYLANDI"},
        {"id": "GA-9E5F6", "product": "Dyson V15 Detect", "risk": 75, "status": "EKİBE_ATANDI"},
        {"id": "GA-1G7H8", "product": "Samsung Galaxy S23 Ultra", "risk": 95, "status": "İADE_REDDEDİLDİ_BLOKE"},
        {"id": "GA-2I9J0", "product": "MacBook Air M2 512GB", "risk": 5, "status": "İADE_ONAYLANDI"},
        {"id": "GA-3K1L2", "product": "Nike Air Force 1 '07", "risk": 45, "status": "EKİBE_ATANDI"},
        {"id": "GA-4M3N4", "product": "Apple Watch Series 8", "risk": 88, "status": "İADE_REDDEDİLDİ_BLOKE"},
        {"id": "GA-5O5P6", "product": "PlayStation 5 Konsol", "risk": 82, "status": "EKİBE_ATANDI"},
        {"id": "GA-6Q7R8", "product": "Logitech MX Master 3S", "risk": 8, "status": "İADE_ONAYLANDI"},
        {"id": "GA-7S9T0", "product": "Philips Airfryer XXL", "risk": 60, "status": "EKİBE_ATANDI"},
        {"id": "GA-8U1V2", "product": "Ray-Ban Aviator Klasik", "risk": 92, "status": "İADE_REDDEDİLDİ_BLOKE"},
        {"id": "GA-9W3X4", "product": "AirPods Pro 2. Nesil", "risk": 78, "status": "EKİBE_ATANDI"},
        {"id": "GA-0Y5Z6", "product": "Nespresso Essenza Mini", "risk": 15, "status": "İADE_ONAYLANDI"},
        {"id": "GA-1A7B8", "product": "Roborock S8 Robot Süpürge", "risk": 68, "status": "EKİBE_ATANDI"},
        {"id": "GA-2C9D0", "product": "iPad Pro 12.9 inç M2", "risk": 96, "status": "İADE_REDDEDİLDİ_BLOKE"},
    ]

    for c in cases:
        # Check if case exists to prevent duplicates on rerun
        existing = db.query(Case).filter(Case.id == c["id"]).first()
        if not existing:
            # Generate mock agent data
            isFraud = c["risk"] >= 80
            isSuspicious = c["risk"] >= 40 and c["risk"] < 80
            
            agent_data = {
                "case_id": c["id"],
                "case_status": c["status"],
                "case_priority": "KRİTİK" if isFraud else "YÜKSEK" if isSuspicious else "DÜŞÜK",
                "risk_score": c["risk"],
                "risk_level": "critical" if isFraud else "medium" if isSuspicious else "low",
                "confidence": 0.98 if isFraud else 0.95,
                "manual_review_required": isFraud or isSuspicious,
                "reason_codes": ["ITEM_SWAP"] if isFraud else ["CONDITION_MISMATCH"] if isSuspicious else [],
                "estimated_financial_impact": "1500 TL",
                "evidence_summary": "Yapay zeka otonom inceleme raporu.",
                "mismatches": [],
                "dispute_report_summary": "N/A",
                "marketplace_appeal_draft": "N/A",
                "customer_response_draft": "İade incelenmektedir.",
                "automated_action_log": ["Otonom analiz tamamlandı."],
                "recommended_next_step": "Onayla",
                "thought_trace": "AI Trace Log..."
            }
            
            image_urls = {
                "original": "/original_product.png",
                "returned": "/returned_product.png"
            }

            case_obj = Case(
                id=c["id"],
                product_name=c["product"],
                risk_score=c["risk"],
                status=c["status"],
                agent_data=agent_data,
                image_urls=image_urls,
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 120))
            )
            db.add(case_obj)
    
    db.commit()
    db.close()
    print("Database seeded with 15 realistic cases successfully.")

if __name__ == "__main__":
    seed_data()
