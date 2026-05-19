from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exceptions import GuardianException, guardian_exception_handler
from app.api.v1.routes import analysis
from app.database import engine, Base
import app.models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GuardianAI API",
    description="Autonomous Operational Security Shield for E-Commerce",
    version="1.0.0"
)

import os
from fastapi.staticfiles import StaticFiles

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Exception Handlers
app.add_exception_handler(GuardianException, guardian_exception_handler)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "GuardianAI Backend"}

# Include routers
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])
