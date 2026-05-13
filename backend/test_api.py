import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_endpoint():
    print("Starting API Test...")
    
    # Check if the images exist
    try:
        with open("original_product.png", "rb") as f1, open("returned_product.png", "rb") as f2:
            files = {
                "original_image": ("original_product.png", f1, "image/png"),
                "returned_image": ("returned_product.png", f2, "image/png")
            }
            
            print("Sending POST request to /api/v1/analyze-return...")
            response = client.post("/api/v1/analyze-return", files=files)
            
            print(f"Status Code: {response.status_code}")
            print("Response JSON:")
            import json
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
                
    except FileNotFoundError as e:
        print(f"Error loading images: {e}")
        
if __name__ == "__main__":
    test_analyze_endpoint()
