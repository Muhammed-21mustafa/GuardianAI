from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="GuardianAI API",
    description="Autonomous Operational Security Shield for E-Commerce",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "GuardianAI Backend"}

# Import and include routers here later
# from app.api.v1.routes import analysis
# app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
