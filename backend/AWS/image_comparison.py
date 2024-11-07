import os
import sys
import logging
from skimage.metrics import structural_similarity as ssim
from PIL import Image
import imagehash
import cv2
import numpy as np
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input
from sklearn.metrics.pairwise import cosine_similarity

class ImageComparison:
    def __init__(self):
        self.setup_logging()
        self.load_vgg_model()

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('image_comparison.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)

    def load_vgg_model(self):
        self.logger.info("Loading VGG16 model...")
        try:
            self.model = VGG16(weights='imagenet', include_top=False)
            self.logger.info("VGG16 model loaded successfully")
        except Exception as e:
            self.logger.error(f"Error loading VGG16 model: {str(e)}")
            raise

    def get_features(self, img_path):
        try:
            img = image.load_img(img_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            return self.model.predict(x).flatten()
        except Exception as e:
            self.logger.error(f"Error extracting features from {img_path}: {str(e)}")
            raise

    def compare_images(self, image1_path: str, image2_path: str) -> dict:
        """
        Compare two images using multiple similarity metrics
        """
        self.logger.info(f"Comparing images: {image1_path} and {image2_path}")
        results = {}

        try:
            # VGG16 Cosine Similarity
            features1 = self.get_features(image1_path)
            features2 = self.get_features(image2_path)
            cosine_sim = cosine_similarity([features1], [features2])[0][0]
            results['cosine_similarity'] = float(cosine_sim)

            # OpenCV Template Matching
            img1 = cv2.imread(image1_path)
            img2 = cv2.imread(image2_path)
            if img1.shape == img2.shape:
                result = cv2.matchTemplate(img1, img2, cv2.TM_CCOEFF_NORMED)
                results['opencv_match'] = float(result[0][0])
            else:
                results['opencv_match'] = None
                self.logger.warning("Images have different sizes, skipping OpenCV matching")

            # SSIM
            img1_gray = cv2.imread(image1_path, cv2.IMREAD_GRAYSCALE)
            img2_gray = cv2.imread(image2_path, cv2.IMREAD_GRAYSCALE)
            if img1_gray.shape == img2_gray.shape:
                score, _ = ssim(img1_gray, img2_gray, full=True)
                results['ssim_score'] = float(score)
            else:
                results['ssim_score'] = None
                self.logger.warning("Images have different sizes, skipping SSIM")

            # pHash
            hash1 = imagehash.phash(Image.open(image1_path))
            hash2 = imagehash.phash(Image.open(image2_path))
            phash_similarity = 1 - (hash1 - hash2) / len(hash1.hash) ** 2
            results['phash_similarity'] = float(phash_similarity)

            self.logger.info("Comparison completed successfully")
            return results

        except Exception as e:
            self.logger.error(f"Error during image comparison: {str(e)}")
            raise

def main():
    if len(sys.argv) != 3:
        print("Usage: python image_comparison.py <image1_path> <image2_path>")
        sys.exit(1)

    image1_path = sys.argv[1]
    image2_path = sys.argv[2]

    comparator = ImageComparison()
    results = comparator.compare_images(image1_path, image2_path)
    
    print("\nImage Comparison Results:")
    print("-" * 30)
    print(f"Cosine Similarity Score: {results['cosine_similarity']:.4f}")
    if results['opencv_match'] is not None:
        print(f"OpenCV Match Score: {results['opencv_match']:.4f}")
    if results['ssim_score'] is not None:
        print(f"SSIM Similarity Score: {results['ssim_score']:.4f}")
    print(f"pHash Similarity: {results['phash_similarity'] * 100:.2f}%")

if __name__ == "__main__":
    main()