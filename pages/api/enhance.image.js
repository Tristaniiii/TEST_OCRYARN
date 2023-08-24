import sharp from 'sharp';

// Enhance image quality using sharp on the server
const enhanceImageWithSharp = async (imageData) => {
  const enhancedImageData = await sharp(imageData)
    .sharpen()
    .toBuffer();
  return enhancedImageData;
};

import express from 'express'; // Use ES6 import here
const router = express.Router();

router.post('/api/enhance-image', async (req, res) => {
  try {
    const imageData = req.body.imageData; // Replace with your actual request data
    const enhancedImageData = await enhanceImageWithSharp(imageData);
    res.status(200).send(enhancedImageData);
  } catch (error) {
    console.error('Error enhancing image:', error);
    res.status(500).send('Error enhancing image');
  }
});

export default router; // Use ES6 export here
