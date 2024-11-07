'use client';
import React, { useState } from 'react';

async function fetchGeneratedImage(prompt: string): Promise<string> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  // Convert the response to a Blob to handle image data
  const blob = await response.blob();
  return URL.createObjectURL(blob); // Create an object URL for the blob
}

const ImageGenerator: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      setError(null); // Clear previous error
      const prompt = "a triangle and a sdfsdfs";

      // Fetch the generated image URL from Hugging Face API
      const imageBlobUrl = await fetchGeneratedImage(prompt);
      setImageUrl(imageBlobUrl);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <h1>Image Generator</h1>
      <button onClick={handleGenerateImage}>Generate Image</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {imageUrl && (
        <div>
          <h2>Generated Image:</h2>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
