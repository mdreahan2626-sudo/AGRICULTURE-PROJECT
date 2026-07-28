import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { app as agent } from './agent.js';

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

const port = process.env.PORT || 5001;

// POST /api/chat - LangGraph agent entrypoint
server.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages history is required' });
    }

    const langchainMessages = messages.map(msg => {
      if (msg.role === 'assistant') {
        return new AIMessage({ content: msg.content });
      } else {
        return new HumanMessage({ content: msg.content });
      }
    });

    const response = await agent.invoke({
      messages: langchainMessages,
    });

    const lastMessage = response.messages[response.messages.length - 1];
    res.json({
      message: lastMessage.content,
    });
  } catch (error) {
    console.error('Chat Service Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Health check endpoint
server.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'chat-service' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Chat microservice running on port ${port}`);
});
