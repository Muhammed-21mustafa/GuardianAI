from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "GuardianAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment Variables
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_VISION: str = "gemini-2.5-flash" # Use flash for fast multimodal reasoning
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
