Inspiration
With the rise of AI, prompt engineering is becoming a critical skill. We wanted to make learning and practicing this skill engaging and competitive, inspiring users to improve their AI interaction abilities in a fun, hands-on way. The idea of making a game out of prompt engineering adds a social, playful dimension to what’s typically a technical process.

What it does
PixelPrompt is a multiplayer game where two users compete to generate AI-generated images that resemble a given target image as closely as possible. Each round displays an inspiration image (e.g., a steampunk interface, or a simple design with a blue top bar and centered circle), and players submit prompts to describe it. Our backend generates images based on these prompts using Flux AI, and the generated images are compared for similarity to the target. The player with the image that most closely resembles the target wins!

How we built it
We used Next.js to build both client and server components of the frontend, providing a smooth, interactive experience. PostgreSQL on Vercel was used for storing user data and game results. FastAPI powers the backend for handling the image generation requests, which uses Flux AI’s API from Hugging Face. For image similarity matching, we deployed a large model on an AWS EC2 instance and managed instance configurations, security, and roles with Terraform.

Challenges we ran into
One of the biggest challenges was optimizing image similarity matching with a large model, which required significant computational resources. We also encountered issues with seamless API integration, prompt handling, and making the multiplayer experience feel real-time.

Accomplishments that we're proud of
We’re proud of successfully integrating multiple technologies to create a functional, enjoyable multiplayer experience. We’re especially proud of setting up AWS EC2 for our large model with Terraform, automating configuration and security.

What we learned
This project taught us a lot about prompt engineering, image generation, and the complexities of deploying large AI models. We also gained experience in real-time game mechanics, image similarity algorithms, and infrastructure management using Terraform.

What's next for PixelPrompt
Next, we plan to enhance the game with more themes and challenges, as well as improve the accuracy of image similarity scoring. We’d also like to add leaderboards, social features, and even more complex prompt scenarios to keep players engaged and learning!
