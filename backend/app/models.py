from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, index=True)
    product_name = Column(String, index=True)
    risk_score = Column(Integer)
    status = Column(String)
    agent_data = Column(JSON)
    image_urls = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
