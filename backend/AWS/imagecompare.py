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
from skimage.feature import hog
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
    similarity = 1 / (1 + err)  # Convert to similarity score (inverse of MSE, normalized)
    return similarity

class ImageComparison:
    def __init__(self):
        self.setup_logging()
        self.upload_dir = "temp_uploads"
        os.makedirs(self.upload_dir, exist_ok=True)

    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("ImageComparison")

    def get_hog_features(self, image_path: str) -> np.ndarray:
        """Extract HOG (Histogram of Oriented Gradients) features"""
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        features, _ = hog(img, pixels_per_cell=(16, 16), cells_per_block=(2, 2), block_norm='L2', visualize=True)
        return features

    def compare_images(self, image1_path: str, image2_path: str) -> ComparisonResponse:
        self.logger.info(f"Comparing images: {image1_path} and {image2_path}")
        
        try:
            # HOG Cosine Similarity
            features1 = self.get_hog_features(image1_path)
            features2 = self.get_hog_features(image2_path)
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

# FastAPI endpoint for image comparison
@app.post("/compare/")
async def compare_images(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    comparison = ImageComparison()
    
    try:
        image1_path = os.path.join(comparison.upload_dir, file1.filename)
        image2_path = os.path.join(comparison.upload_dir, file2.filename)
        
        with open(image1_path, "wb") as buffer:
            buffer.write(file1.file.read())
        with open(image2_path, "wb") as buffer:
            buffer.write(file2.file.read())
        
        response = comparison.compare_images(image1_path, image2_path)
        return JSONResponse(content=response.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
