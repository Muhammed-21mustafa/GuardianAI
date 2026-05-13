import google.generativeai as genai
from PIL import Image
import json
from app.core.config import settings
from app.core.exceptions import LLMProcessingError
from app.schemas.analysis import ImageAnalysis

# Initialize SDK
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        # We use flash as requested (it's fast and has vision capabilities)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL_VISION)

    def analyze_image(self, image: Image.Image, context: str) -> ImageAnalysis:
        """
        Sends an image to Gemini Vision to extract structured fields.
        """
        prompt = f"""
        Analyze this image carefully. This is {context}.
        You must return a JSON object strictly matching the following schema:
        {{
            "product_type": "string",
            "color": "string",
            "condition": "string",
            "visible_damage": "string",
            "label_status": "string",
            "packaging_status": "string",
            "accessories": "string",
            "confidence": 0.0 to 1.0
        }}
        Provide ONLY valid JSON.
        """
        
        try:
            # Using standard generate_content. For Gemini 2.5 flash we can also use response_schema, 
            # but standard JSON prompting is highly reliable as well.
            response = self.model.generate_content(
                [prompt, image],
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            
            data = json.loads(response.text)
            return ImageAnalysis(**data)
            
        except Exception as e:
            raise LLMProcessingError(f"Gemini analysis failed: {str(e)}")

gemini_service = GeminiService()
