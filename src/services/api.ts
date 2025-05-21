
import axios from 'axios';

// API base URL - use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API client instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ModelType = 'gemini-pro' | 'claude-3-sonnet' | 'grok-1';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface CustomModel {
  id: string;
  name: string;
  apiEndpoint: string;
  apiKey: string;
}

interface ChatRequest {
  model: ModelType;
  message: string;
  conversation_id?: string;
  custom_model?: CustomModel;
  system_prompt?: string;
  files?: File[];
}

interface ChatResponse {
  response: string;
  conversation_id: string;
  role?: 'assistant';
  content?: string;
  error?: string;
}

interface Chat {
  _id: string;
  user_id: string;
  title: string;
  model: ModelType;
  created_at: string;
  updated_at: string;
  system_prompt?: string;
}

interface ChatsResponse {
  chats: Chat[];
  error?: string;
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
  error?: string;
}

// Send a chat message to the backend
const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    // Handle file uploads if present
    if (request.files && request.files.length > 0) {
      console.log(`Preparing to upload ${request.files.length} files`);
      // We would need to implement a multipart/form-data upload here
    }
    
    const response = await apiClient.post<ChatResponse>('/chat', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to connect to the server');
  }
};

// Get all chats for the current user
const getChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get<ChatsResponse>('/chats');
    return response.data.chats || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to fetch chats');
  }
};

// Get chat history for a specific conversation
const getChatHistory = async (chatId: string, limit = 50): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get<ChatHistoryResponse>(`/chats/${chatId}?limit=${limit}`);
    return response.data.messages || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to fetch chat history');
  }
};

// Delete a chat
const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    console.log(`Deleting chat with ID: ${chatId}`);
    const response = await apiClient.delete(`/chats/${chatId}`);
    console.log("Delete response:", response.data);
    return response.data.success;
  } catch (error) {
    console.error("Error deleting chat:", error);
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to delete chat');
  }
};

// Update system prompt for a chat
const updateSystemPrompt = async (chatId: string, systemPrompt: string): Promise<boolean> => {
  try {
    console.log(`Updating system prompt for chat ${chatId}:`, systemPrompt);
    const response = await apiClient.patch(`/chats/${chatId}/system-prompt`, {
      system_prompt: systemPrompt
    });
    console.log("Update system prompt response:", response.data);
    return response.data.success;
  } catch (error) {
    console.error("Error updating system prompt:", error);
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to update system prompt');
  }
};

// Send a message to the API, handling both new chats and existing chats
const sendMessage = async (
  chatId: string,
  message: string,
  model: ModelType,
  systemPrompt?: string,
  files?: File[]
): Promise<{ role: 'assistant', content: string, conversation_id?: string }> => {
  const request: ChatRequest = {
    model,
    message,
    conversation_id: chatId || undefined,
  };

  // Add system prompt if provided
  if (systemPrompt) {
    request.system_prompt = systemPrompt;
  }
  
  // Add files if provided
  if (files && files.length > 0) {
    request.files = files;
  }

  const response = await sendChatMessage(request);
  
  return {
    role: 'assistant',
    content: response.response,
    conversation_id: response.conversation_id
  };
};

// Export API functions as a service object
export const apiService = {
  sendChatMessage,
  getChats,
  getChatHistory,
  deleteChat,
  sendMessage,
  updateSystemPrompt,
};

// Also export individual functions for compatibility
export {
  sendChatMessage,
  getChats,
  getChatHistory,
  deleteChat,
  sendMessage,
  updateSystemPrompt,
};
