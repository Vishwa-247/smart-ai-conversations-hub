
import axios from 'axios';
import { Chat, Message, ModelType } from '../contexts/ChatContext';

// Create an Axios instance with default configs
const api = axios.create({
  baseURL: '/api', // This will be proxied in Vite to the backend service
  timeout: 60000, // AI responses can be slow, so we set a long timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock API functions for now - in a real app, these would connect to the backend
export const apiService = {
  // Get all chats for the user
  getChats: async (): Promise<Chat[]> => {
    // For now, we'll use local storage to simulate persistence
    const storedChats = localStorage.getItem('chats');
    return storedChats ? JSON.parse(storedChats) : [];
  },
  
  // Get a single chat by ID
  getChat: async (chatId: string): Promise<Chat | null> => {
    const storedChats = localStorage.getItem('chats');
    const chats: Chat[] = storedChats ? JSON.parse(storedChats) : [];
    return chats.find(chat => chat.id === chatId) || null;
  },
  
  // Send a message and get a response
  sendMessage: async (chatId: string, message: string, model: ModelType): Promise<Message> => {
    // In a real app, this would send to the backend
    console.log(`Sending message to ${model}: ${message}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response based on model
    const modelResponses: Record<ModelType, string[]> = {
      'gpt-4o': [
        "I'm GPT-4o, here to assist you with any questions or tasks!",
        "That's an interesting question. Let me think about that...",
        "Based on my knowledge, here's what I can tell you about that topic."
      ],
      'gpt-4o-mini': [
        "GPT-4o-mini here! How can I help you today?",
        "Good question! Here's a concise answer for you.",
        "I'll do my best to assist with that request."
      ],
      'claude-3-sonnet': [
        "Claude-3-Sonnet at your service. I'd be happy to help with that.",
        "Let me carefully consider your question to provide the most helpful response.",
        "I aim to be thoughtful and nuanced in my answers. Here's what I think."
      ],
      'gemini-pro': [
        "Gemini Pro here, ready to assist you with information and insights.",
        "Thanks for your question! Here's what I found...",
        "I'm processing your request and generating a helpful response."
      ],
      'grok-1': [
        "Grok-1 here with a slightly irreverent but helpful answer!",
        "Oh, that's a good one. Let me think outside the box here...",
        "Unlike those other boring AIs, I'll give you the straight talk on this."
      ]
    };
    
    // Pick a random response for the selected model
    const responses = modelResponses[model];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: randomResponse,
      timestamp: new Date(),
      model
    };
  },
  
  // Create a new chat
  createChat: async (model: ModelType): Promise<Chat> => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to local storage
    const storedChats = localStorage.getItem('chats');
    const chats: Chat[] = storedChats ? JSON.parse(storedChats) : [];
    localStorage.setItem('chats', JSON.stringify([newChat, ...chats]));
    
    return newChat;
  },
  
  // Delete a chat
  deleteChat: async (chatId: string): Promise<void> => {
    const storedChats = localStorage.getItem('chats');
    const chats: Chat[] = storedChats ? JSON.parse(storedChats) : [];
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  },
  
  // Update a chat (e.g., rename)
  updateChat: async (chatId: string, updates: Partial<Chat>): Promise<Chat> => {
    const storedChats = localStorage.getItem('chats');
    const chats: Chat[] = storedChats ? JSON.parse(storedChats) : [];
    
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, ...updates, updatedAt: new Date() };
      }
      return chat;
    });
    
    localStorage.setItem('chats', JSON.stringify(updatedChats));
    
    return updatedChats.find(chat => chat.id === chatId)!;
  }
};
