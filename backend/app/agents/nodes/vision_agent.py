import io
from PIL import Image
from typing import TypedDict, Any
from app.services.gemini_service import gemini_service

def vision_agent_node(state: dict) -> dict:
    """
    Node 1: Parses original and returned images and extracts structured attributes.
    """
    original_img_bytes = state.get("original_image_bytes")
    returned_img_bytes = state.get("returned_image_bytes")

    # Load PIL Images
    original_img = Image.open(io.BytesIO(original_img_bytes)).convert("RGB")
    returned_img = Image.open(io.BytesIO(returned_img_bytes)).convert("RGB")

    # Analyze via Gemini Service
    orig_analysis = gemini_service.analyze_image(
        original_img, "the original shipped product before packing"
    )
    
    ret_analysis = gemini_service.analyze_image(
        returned_img, "the product returned by the customer"
    )

    return {
        "original_analysis": orig_analysis,
        "returned_analysis": ret_analysis
    }
