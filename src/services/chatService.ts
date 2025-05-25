
import { apiClient } from './apiClient';
import { ChatRequest, ChatResponse, Chat, ChatsResponse, ChatHistoryResponse, ChatMessage, ModelType } from './types';
import { callGeminiAPI } from './geminiService';

// Timeout for API requests (30 seconds)
const API_TIMEOUT = 30000;

// Create a timeout promise
const createTimeoutPromise = (timeout: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

// Send a chat message to the backend with timeout handling
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    if (request.files && request.files.length > 0) {
      console.log(`Preparing to upload ${request.files.length} files`);
    }
    
    console.log('Sending request to backend:', request);
    
    // Race between the actual request and timeout
    const responsePromise = apiClient.post<ChatResponse>('/chat', request);
    const timeoutPromise = createTimeoutPromise(API_TIMEOUT);
    
    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    console.log('Response from backend:', response.data);
    
    if (response.data.content && !response.data.response) {
      response.data.response = response.data.content;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error in sendChatMessage:', error);
    if (error.message === 'Request timeout') {
      throw new Error('Request timed out. The model might be taking longer than usual to respond.');
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to connect to the server');
  }
};

// Get all chats for the current user
export const getChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get<ChatsResponse>('/chats');
    return response.data.chats || [];
  } catch (error: any) {
    console.error('Error in getChats:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch chats');
  }
};

// Get chat history for a specific conversation
export const getChatHistory = async (chatId: string, limit = 50): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get<ChatHistoryResponse>(`/chats/${chatId}?limit=${limit}`);
    return response.data.messages || [];
  } catch (error: any) {
    console.error('Error in getChatHistory:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch chat history');
  }
};

// Delete a chat
export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    console.log(`Deleting chat with ID: ${chatId}`);
    const response = await apiClient.delete(`/chats/${chatId}`);
    console.log("Delete response:", response.data);
    return response.data.success;
  } catch (error: any) {
    console.error("Error deleting chat:", error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to delete chat');
  }
};

// Update system prompt for a chat
export const updateSystemPrompt = async (chatId: string, systemPrompt: string): Promise<boolean> => {
  try {
    console.log(`Updating system prompt for chat ${chatId}:`, systemPrompt);
    const response = await apiClient.patch(`/chats/${chatId}/system-prompt`, {
      system_prompt: systemPrompt
    });
    console.log("Update system prompt response:", response.data);
    return response.data.success;
  } catch (error: any) {
    console.error("Error updating system prompt:", error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to update system prompt');
  }
};

// Send a message to the API with optimized async handling
export const sendMessage = async (
  chatId: string,
  message: string,
  model: ModelType,
  systemPrompt?: string,
  files?: File[]
): Promise<{ role: 'assistant', content: string, conversation_id?: string }> => {
  
  // Handle Gemini model directly with timeout
  if (model === 'gemini-2.0-flash') {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system' as const, content: systemPrompt });
      }
      
      messages.push({ role: 'user' as const, content: message });
      
      // Race between Gemini API call and timeout
      const geminiPromise = callGeminiAPI(messages);
      const timeoutPromise = createTimeoutPromise(API_TIMEOUT);
      
      const response = await Promise.race([geminiPromise, timeoutPromise]) as string;
      
      return {
        role: 'assistant',
        content: response,
        conversation_id: chatId || `gemini_${Date.now()}`
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      if (error.message === 'Request timeout') {
        throw new Error('Gemini API timed out. Please try again.');
      }
      throw new Error('Failed to get response from Gemini');
    }
  }

  // For other models, use the existing backend API with timeout
  const request: ChatRequest = {
    model,
    message,
    conversation_id: chatId || undefined,
    use_rag: true,
  };

  if (systemPrompt) {
    request.system_prompt = systemPrompt;
  }
  
  if (files && files.length > 0) {
    request.files = files;
  }

  const response = await sendChatMessage(request);
  
  return {
    role: 'assistant',
    content: response.response || response.content,
    conversation_id: response.conversation_id
  };
};
