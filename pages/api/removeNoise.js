const cv = require('opencv4nodejs');

export default async function handler(req, res) {
  try {
    const { base64Image } = req.body;

    // Convert base64 image to buffer
    const buffer = Buffer.from(base64Image, 'base64');

    // Read image from buffer
    const image = cv.imdecode(buffer);

    // Apply noise removal (example: Gaussian blur)
    const blurredImage = image.gaussianBlur(new cv.Size(3, 3), 0);

    // Convert image to base64
    const base64BlurredImage = cv.imencode('.jpg', blurredImage).toString('base64');

    res.json({ base64BlurredImage });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
