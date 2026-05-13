from google import genai
from google.genai import types
from PIL import Image
from app.core.config import settings
from app.core.exceptions import LLMProcessingError
from app.schemas.analysis import ImageAnalysis

class GeminiService:
    def __init__(self):
        # We use flash as requested (it's fast and has vision capabilities)
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL_VISION

    def analyze_image(self, image: Image.Image, context: str) -> ImageAnalysis:
        """
        Sends an image to Gemini Vision to extract structured fields.
        """
        prompt = f"""
        Analyze this image carefully. This is {context}.
        You must extract the exact information required by the JSON schema.
        """
        
        try:
            # Using the modern google-genai SDK with structured output
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[image, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ImageAnalysis,
                )
            )
            
            # The structured output automatically matches the Pydantic schema
            import json
            data = json.loads(response.text)
            return ImageAnalysis(**data)
            
        except Exception as e:
            raise LLMProcessingError(f"Gemini analysis failed: {str(e)}")

gemini_service = GeminiService()
