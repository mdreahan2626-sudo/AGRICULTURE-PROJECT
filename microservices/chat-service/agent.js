import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { predictCrop } from "./predictor.js";

// Initialize Gemini LLM using LangChain integration
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
});

// Tool: Weather Advisor
const weatherAdvisorTool = tool(
  async ({ location }) => {
    try {
      // 1. Resolve location
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
      const geocodeRes = await fetch(geocodeUrl);
      const geocodeData = await geocodeRes.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        return `Could not resolve location: "${location}"`;
      }

      const resolvedLocation = geocodeData.results[0];
      const { name, latitude, longitude, country, admin1 } = resolvedLocation;

      // 2. Query Weather API (Open-Meteo)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      if (!weatherData.current || !weatherData.daily) {
        return `Failed to retrieve weather data for "${location}"`;
      }

      const current = weatherData.current;
      const daily = weatherData.daily;

      return JSON.stringify({
        location: `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`,
        coordinates: { latitude, longitude },
        currentWeather: {
          temp: `${current.temperature_2m}°C`,
          humidity: `${current.relative_humidity_2m}%`,
          precipitation: `${current.precipitation} mm`
        },
        forecast3Day: [
          {
            date: daily.time[0],
            tempRange: `${daily.temperature_2m_min[0]}°C to ${daily.temperature_2m_max[0]}°C`,
            precipitation: `${daily.precipitation_sum[0]}mm (Chance: ${daily.precipitation_probability_max[0]}%)`
          },
          {
            date: daily.time[1],
            tempRange: `${daily.temperature_2m_min[1]}°C to ${daily.temperature_2m_max[1]}°C`,
            precipitation: `${daily.precipitation_sum[1]}mm (Chance: ${daily.precipitation_probability_max[1]}%)`
          },
          {
            date: daily.time[2],
            tempRange: `${daily.temperature_2m_min[2]}°C to ${daily.temperature_2m_max[2]}°C`,
            precipitation: `${daily.precipitation_sum[2]}mm (Chance: ${daily.precipitation_probability_max[2]}%)`
          }
        ]
      });
    } catch (err) {
      return `Error in weatherAdvisorTool: ${err.message}`;
    }
  },
  {
    name: "weatherAdvisor",
    description: "Gets weather information (current and 3-day forecast) for a farm location/city. Use this when the user asks about the weather or crop-watering suggestions based on the weather.",
    schema: z.object({
      location: z.string().describe("The location name (city, town, region, etc.)"),
    }),
  }
);

// Tool: Crop Predictor
const cropPredictorTool = tool(
  async ({ temperature, humidity, moisture, soilType, nitrogen, potassium, phosphorous }) => {
    try {
      const predictedCrop = predictCrop({
        temperature,
        humidity,
        moisture,
        soilType,
        nitrogen,
        potassium,
        phosphorous
      });
      return `Based on prediction parameters:
- Temperature: ${temperature}°C
- Humidity: ${humidity}%
- Soil Moisture: ${moisture}%
- Soil Type: ${soilType}
- Nitrogen (N): ${nitrogen}
- Potassium (K): ${potassium}
- Phosphorous (P): ${phosphorous}

The predicted crop that is most suitable to grow is: ${predictedCrop}`;
    } catch (err) {
      return `Error running crop prediction: ${err.message}`;
    }
  },
  {
    name: "cropPredictor",
    description: "Predicts the best crop to cultivate based on environmental and soil parameters. Use this when the user asks what crop to grow or provides soil test values.",
    schema: z.object({
      temperature: z.number().describe("Temperature in Celsius degree"),
      humidity: z.number().describe("Relative humidity percentage"),
      moisture: z.number().describe("Soil moisture percentage"),
      soilType: z.enum(["Sandy", "Loamy", "Black", "Red", "Clayey"]).describe("Soil Type"),
      nitrogen: z.number().describe("Nitrogen (N) level in soil"),
      potassium: z.number().describe("Potassium (K) level in soil"),
      phosphorous: z.number().describe("Phosphorous (P) level in soil")
    }),
  }
);

// Define tools array
const tools = [weatherAdvisorTool, cropPredictorTool];
const toolNode = new ToolNode(tools);

// Bind tools to the model
const modelWithTools = model.bindTools(tools);

// Define callModel node
const callModel = async (state) => {
  const { messages } = state;
  
  const systemPrompt = {
    role: "system",
    content: `You are "AgroBot", a friendly, expert AI agricultural consultant.
Your purpose is to answer the farmer's queries about soil, crop health, planting times, crop diseases, organic/chemical treatments, and weather effects.
Speak in a highly supportive, clear, and concise manner.

If a farmer asks about weather conditions or recommendations for a location, use the 'weatherAdvisor' tool.
If a farmer asks to predict a crop or input soil conditions, use the 'cropPredictor' tool.

Language Guidelines:
- You support: English, Hindi (हिंदी), Bengali (বাংলা), Marathi (मराठी), Tamil (தமிழ்), and Telugu (తెలుగు).
- Always respond in the language that the farmer writes or speaks in.
- Keep your answers brief, readable, and easy to follow (maximum 100 words). Use bullet points if necessary.`
  };
  
  const response = await modelWithTools.invoke([systemPrompt, ...messages]);
  return { messages: [response] };
};

// Router function to check if tool calls are needed
const shouldContinue = (state) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
};

// Define custom State Annotation
const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  })
});

// Create state graph
const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    __end__: END
  })
  .addEdge("tools", "agent");

// Compile the graph
export const app = workflow.compile();
export { tools };
