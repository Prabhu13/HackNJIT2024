# PixelPrompt

## Inspiration
With the rise of AI, prompt engineering is becoming a critical skill. We wanted to make learning and practicing this skill engaging and competitive, inspiring users to improve their AI interaction abilities in a fun, hands-on way. The idea of making a game out of prompt engineering adds a social, playful dimension to what’s typically a technical process.

## What it does
PixelPrompt is a multiplayer game where two users compete to generate AI-generated images that resemble a given target image as closely as possible. Each round displays an inspiration image (e.g., a steampunk interface, or a simple design with a blue top bar and centered circle), and players submit prompts to describe it. Our backend generates images based on these prompts using Flux AI, and the generated images are compared for similarity to the target using a combination of several image comparison techniques. This includes structural similarity index (SSIM), cosine similarity from deep feature extraction, OpenCV template matching, and perceptual hash (pHash). The player with the image that most closely resembles the target wins!

## How we built it
We used Next.js to build both client and server components of the frontend, providing a smooth, interactive experience. PostgreSQL on Vercel was used for storing user data and game results. FastAPI powers the backend for handling the image generation requests, which uses Flux AI’s API from Hugging Face. For image similarity matching, we integrated a variety of libraries and models:
- **TensorFlow** with the VGG16 model for feature extraction and cosine similarity computation.
- **scikit-image** for SSIM calculation.
- **OpenCV** for template matching.
- **ImageHash** for perceptual hashing.
  
These technologies work in tandem to deliver a precise similarity score, which determines the winner of each round. The entire model deployment, instance configuration, security, and roles were managed using Terraform on AWS EC2.

## Challenges we ran into
One of the biggest challenges was optimizing image similarity matching with multiple models and algorithms, which required significant computational resources. We also encountered issues with seamless API integration, prompt handling, and making the multiplayer experience feel real-time.

## Accomplishments that we're proud of
We’re proud of successfully integrating multiple technologies to create a functional, enjoyable multiplayer experience. We’re especially proud of setting up AWS EC2 for our large model with Terraform, automating configuration and security, and implementing a robust image similarity scoring system with various techniques.

## What we learned
This project taught us a lot about prompt engineering, image generation, and the complexities of deploying large AI models. We also gained experience in real-time game mechanics, advanced image similarity algorithms, and infrastructure management using Terraform.

## What's next for PixelPrompt
Next, we plan to enhance the game with more themes and challenges, as well as improve the accuracy of image similarity scoring. We’d also like to add leaderboards, social features, and even more complex prompt scenarios to keep players engaged and learning!

## Important Libraries and Tools Used
- **TensorFlow/Keras (VGG16)**: For deep feature extraction and cosine similarity scoring.
- **scikit-image**: Used for computing SSIM to gauge structural similarity.
- **OpenCV**: Utilized for template matching, adding another layer of comparison.
- **ImageHash**: Used to generate perceptual hashes for image comparison.
- **Terraform**: To automate AWS instance setup and manage configurations.
  
## Getting Started
To get started with the project:
1. Clone the repository.
2. Set up your virtual environment.
3. Install the required packages as per `requirements.txt`.
4. Configure your AWS environment using Terraform to deploy the large model for image similarity scoring.
5. Update your `.env` file with necessary API keys and environment variables.

## Usage
Run the following command to start the game server:
```bash
python image_comparison.py <image1_path> <image2_path>
