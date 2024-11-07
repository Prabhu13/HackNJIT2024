import os
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from PIL import Image
import imagehash
import cv2
import numpy as np
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input
from sklearn.metrics.pairwise import cosine_similarity

# Initialize FastAPI app
app = FastAPI(
    title="Image Comparison API",
    description="API for comparing images using multiple similarity metrics",
    version="1.0.0"
)

# Pydantic models for request/response validation
class ComparisonResponse(BaseModel):
    cosine_similarity: float
    opencv_match: Optional[float]
    mse_score: Optional[float]  # MSE instead of SSIM
    phash_similarity: float

def calculate_mse(image1, image2):
    """Calculate Mean Squared Error between two images"""
    err = np.sum((image1.astype("float") - image2.astype("float")) ** 2)
    err /= float(image1.shape[0] * image1.shape[1])
    # Convert to similarity score (inverse of MSE, normalized)
    similarity = 1 / (1 + err)
    return similarity

class ImageComparison:
    def __init__(self):
        self.setup_logging()
        self.load_vgg_model()
        self.upload_dir = "temp_uploads"
        os.makedirs(self.upload_dir, exist_ok=True)

    # ... [Previous setup_logging and load_vgg_model methods remain the same]

    def compare_images(self, image1_path: str, image2_path: str) -> ComparisonResponse:
        self.logger.info(f"Comparing images: {image1_path} and {image2_path}")
        
        try:
            # VGG16 Cosine Similarity
            features1 = self.get_features(image1_path)
            features2 = self.get_features(image2_path)
            cosine_sim = cosine_similarity([features1], [features2])[0][0]

            # OpenCV Template Matching
            img1 = cv2.imread(image1_path)
            img2 = cv2.imread(image2_path)
            opencv_match = None
            mse_score = None
            
            if img1.shape == img2.shape:
                result = cv2.matchTemplate(img1, img2, cv2.TM_CCOEFF_NORMED)
                opencv_match = float(result[0][0])
                # Calculate MSE-based similarity
                img1_gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
                img2_gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
                mse_score = float(calculate_mse(img1_gray, img2_gray))

            # pHash
            hash1 = imagehash.phash(Image.open(image1_path))
            hash2 = imagehash.phash(Image.open(image2_path))
            phash_similarity = 1 - (hash1 - hash2) / len(hash1.hash) ** 2

            return ComparisonResponse(
                cosine_similarity=float(cosine_sim),
                opencv_match=opencv_match,
                mse_score=mse_score,
                phash_similarity=float(phash_similarity)
            )

        except Exception as e:
            self.logger.error(f"Error during image comparison: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            # Cleanup temporary files
            if os.path.exists(image1_path):
                os.remove(image1_path)
            if os.path.exists(image2_path):
                os.remove(image2_path)

# ... [Rest of the FastAPI endpoints remain the same]