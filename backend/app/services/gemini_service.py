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

    def analyze_image(self, image: Image.Image, context: str, order_desc: str = "") -> ImageAnalysis:
        """
        Sends an image to Gemini Vision to extract structured fields.
        """
        prompt = f"""
        Analyze this image carefully. This is {context}.
        You must extract the exact information required by the JSON schema.
        
        CRITICAL FRAMING RULE: You must first analyze the composition/framing of the 'Returned Product' image.
        
        IF it is clearly a MACRO or CLOSE-UP shot focusing heavily on a specific damage (e.g., zoomed in on a dent, filling the frame), DO NOT assume out-of-frame accessories are missing.
        
        HOWEVER, IF it is a WIDE SHOT or FULL-BODY SHOT (e.g., the product is laid out on a table, bed, or inside its open box) and a standard core accessory (like a charger, cable, or secondary module) is clearly absent from this wide composition, you MUST accurately flag it as 'Missing Accessory' or 'Incomplete Return'.
        
        CRITICAL CLASSIFICATION RULE: When extracting 'product_type', ALWAYS output the value in ENGLISH. If the item in the image is the correct expected product (or a close-up of it), you MUST output the EXACT product name from the order description (translate to English if needed). DO NOT use synonyms. ONLY output a different 'product_type' if it is undeniably a COMPLETELY DIFFERENT object (e.g., soap instead of a phone) indicating a fraudulent item swap.
        """
        if order_desc:
            prompt += f"\nCRITICAL CONTEXT: The merchant's order system describes this product as: '{order_desc}'. If the item in the image visually contradicts this description (e.g. image shows an iPhone but description says shoes), you MUST explicitly state this contradiction in the 'product_type' or 'visible_damage' field."
        
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

    def generate_text(self, prompt: str) -> str:
        """
        Generates raw text using Gemini.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise LLMProcessingError(f"Gemini text generation failed: {str(e)}")

    def semantic_verification(self, orig_pt: str, ret_pt: str, orig_dmg: str, ret_dmg: str) -> dict:
        """
        Runs a quick semantic check using Gemini to see if product types and damage descriptions
        are equivalent despite wording differences.
        """
        prompt = f"""
        Compare the following original and returned product descriptions to determine if they are semantically equivalent.
        
        Original Product Type: '{orig_pt}'
        Returned Product Type: '{ret_pt}'
        
        Original Damage/Condition: '{orig_dmg}'
        Returned Damage/Condition: '{ret_dmg}'
        
        Return STRICT JSON format exactly like this:
        {{
            "product_match": {{
                "same_category": true,
                "category_distance": "same", 
                "explanation": "Shoe and sneaker belong to the same footwear category.",
                "confidence": 0.95
            }},
            "damage_match": {{
                "is_new_damage": false,
                "explanation": "Yellowish stain is the same as yellowish discoloration.",
                "confidence": 0.90
            }}
        }}
        
        Rules for product_match.category_distance: "same" | "similar" | "related" | "different"
        Rules for damage_match.is_new_damage: True ONLY IF returned damage is completely new and worse than the original. If both are "none", false. If both describe the same damage but with different words, false. If returned is damaged but original is clean, true.
        """
        
        try:
            import json
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            # Fallback if Gemini fails
            return {
                "product_match": {"same_category": False, "category_distance": "different", "explanation": "Fallback due to error.", "confidence": 0.0},
                "damage_match": {"is_new_damage": True, "explanation": "Fallback due to error.", "confidence": 0.0}
            }

gemini_service = GeminiService()
