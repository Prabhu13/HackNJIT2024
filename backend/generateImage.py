from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import base64
import os
import uuid  # For generating random filenames
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

app = FastAPI()

# Enable CORS for frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hugging Face API Token
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
if not HUGGINGFACE_TOKEN:
    raise EnvironmentError("HUGGINGFACE_TOKEN environment variable not set.")

# Hugging Face API URL
API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"

class ImagePrompt(BaseModel):
    prompt: str

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/generate_image")
async def generate_image(prompt: ImagePrompt):
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {"inputs": prompt.prompt}

    # Log request details
    logger.debug(f"Sending request to Hugging Face API with payload: {payload}")
    logger.debug(f"Headers: {headers}")

    # Send request to Hugging Face API
    response = requests.post(API_URL, headers=headers, json=payload)

    # Log response details
    logger.debug(f"Response status code: {response.status_code}")
    logger.debug(f"Response content: {response.content}")

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to generate image.")

    # Generate a random filename for the image
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join("images", filename)  

    # Save the image
    os.makedirs("images", exist_ok=True)  # Create the directory if it doesn't exist
    with open(filepath, "wb") as image_file:
        image_file.write(response.content)

    # Convert image blob to base64 string if needed
    base64_image = base64.b64encode(response.content).decode("utf-8")
    
    return {"image_filename": filename, "image_base64": base64_image}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)