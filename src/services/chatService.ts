import { apiClient } from './apiClient';
import { ChatRequest, ChatResponse, Chat, ChatsResponse, ChatHistoryResponse, ChatMessage, ModelType } from './types';
import { callGeminiAPI } from './geminiService';

// Send a chat message to the backend
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    // Handle file uploads if present
    if (request.files && request.files.length > 0) {
      console.log(`Preparing to upload ${request.files.length} files`);
      // We would need to implement a multipart/form-data upload here
    }
    
    console.log('Sending request to backend:', request);
    const response = await apiClient.post<ChatResponse>('/chat', request);
    console.log('Response from backend:', response.data);
    
    // Ensure we have the response content in the expected format
    if (response.data.content && !response.data.response) {
      response.data.response = response.data.content;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error in sendChatMessage:', error);
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

// Send a message to the API, handling both new chats and existing chats
export const sendMessage = async (
  chatId: string,
  message: string,
  model: ModelType,
  systemPrompt?: string,
  files?: File[]
): Promise<{ role: 'assistant', content: string, conversation_id?: string }> => {
  
  // Handle Gemini model directly
  if (model === 'gemini-2.0-flash') {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system' as const, content: systemPrompt });
      }
      
      messages.push({ role: 'user' as const, content: message });
      
      const response = await callGeminiAPI(messages);
      
      return {
        role: 'assistant',
        content: response,
        conversation_id: chatId || `gemini_${Date.now()}`
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get response from Gemini');
    }
  }

  // For other models, use the existing backend API
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
