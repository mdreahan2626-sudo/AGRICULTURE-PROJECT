import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json({ limit: '50mb' }));

const port = process.env.PORT || 5003;

// POST /api/detect-disease - Computer Vision plant leaf classification
server.post('/api/detect-disease', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Process base64 data and mime type
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const promptText = `
You are a state-of-the-art plant pathology expert AI.
Analyze the uploaded image of a plant leaf and determine if there is a disease.
Provide your response in a strict JSON format matching the schema below.

JSON Schema fields:
- diseaseName: Name of the disease (e.g. "Tomato Late Blight", "Healthy Leaf", "Corn Rust"). If the image is not a plant or leaf, output "Not a plant leaf".
- confidenceScore: Estimated accuracy of diagnosis as a number from 0 to 100.
- severity: Estimated infection level. One of: "Healthy", "Mild", "Moderate", "Severe".
- organicTreatment: Practical organic control recommendation (1-2 sentences).
- chemicalTreatment: Recommended chemical pesticide/fungicide control option (1-2 sentences).
- nearbyPesticide: Advice on what type of pesticide/fungicide formulation to buy at a local store.

Return ONLY the JSON structure. Do not include markdown code block syntax (like \`\`\`json).
`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API Error details:', geminiData);
      throw new Error(geminiData.error?.message || 'Gemini API call failed');
    }

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const diagnosis = JSON.parse(responseText.trim());

    res.json({
      diagnosis,
      message: 'Image disease classification complete'
    });
  } catch (error) {
    console.error('Disease Detection Service Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'disease-service' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Disease microservice running on port ${port}`);
});
