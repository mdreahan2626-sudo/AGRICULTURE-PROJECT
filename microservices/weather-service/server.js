import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

const port = process.env.PORT || 5002;

// POST /api/weather-advisor - Specialized weather analysis route
server.post('/api/weather-advisor', async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    // 1. Resolve city coordinates using Geocoding API (Open-Meteo)
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return res.status(400).json({ error: `Could not resolve location: "${location}"` });
    }

    const resolvedLocation = geocodeData.results[0];
    const { name, latitude, longitude, country, admin1 } = resolvedLocation;

    // 2. Query Weather API (Open-Meteo)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherData.current || !weatherData.daily) {
      return res.status(500).json({ error: 'Failed to retrieve weather data' });
    }

    const current = weatherData.current;
    const daily = weatherData.daily;

    const weatherSummary = `
Location: ${name}, ${admin1 ? admin1 + ', ' : ''}${country}
Current Weather:
- Temperature: ${current.temperature_2m}°C
- Humidity: ${current.relative_humidity_2m}%
- Current Precipitation: ${current.precipitation} mm

3-Day Forecast:
- Day 1: Min: ${daily.temperature_2m_min[0]}°C, Max: ${daily.temperature_2m_max[0]}°C, Rain: ${daily.precipitation_sum[0]}mm, Chance: ${daily.precipitation_probability_max[0]}%
- Day 2: Min: ${daily.temperature_2m_min[1]}°C, Max: ${daily.temperature_2m_max[1]}°C, Rain: ${daily.precipitation_sum[1]}mm, Chance: ${daily.precipitation_probability_max[1]}%
- Day 3: Min: ${daily.temperature_2m_min[2]}°C, Max: ${daily.temperature_2m_max[2]}°C, Rain: ${daily.precipitation_sum[2]}mm, Chance: ${daily.precipitation_probability_max[2]}%
`;

    const prompt = `
You are an advanced, context-aware agricultural AI assistant.
Based on the following weather data for a farm location, provide 3 highly actionable agricultural recommendations for farmers.
For example, state whether to irrigate, hold off irrigation due to rain, spray pesticides or fungicides (e.g. based on humidity/wind), harvest, or fertilize.
Make the advice brief, direct, and conversational (e.g. "Rain is expected tomorrow. Don't irrigate today.").

Weather Details:
${weatherSummary}

Response guidelines:
- Output exactly 3 advice points.
- Keep each point under 12 words.
- Be direct, friendly, and authoritative.
- Output ONLY the 3 advice points, separated by newlines. No intro, no explanations.
`;

    // 3. Query Gemini API
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
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API Error details:', geminiData);
      throw new Error(geminiData.error?.message || 'Gemini API call failed');
    }

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const suggestions = responseText
      .split('\n')
      .map(line => line.replace(/^[-*•\d.\s]+/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);

    res.json({
      location: {
        name,
        country,
        state: admin1 || null,
        latitude,
        longitude
      },
      currentWeather: {
        temp: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation
      },
      dailyForecast: {
        tempsMax: daily.temperature_2m_max.slice(0, 3),
        tempsMin: daily.temperature_2m_min.slice(0, 3),
        rainSum: daily.precipitation_sum.slice(0, 3),
        rainChance: daily.precipitation_probability_max.slice(0, 3),
        dates: daily.time.slice(0, 3)
      },
      advisorSuggestions: suggestions
    });
  } catch (error) {
    console.error('Weather Advisor Service Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'weather-service' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Weather microservice running on port ${port}`);
});
