
import axios from 'axios';
import { apiClient } from './apiClient';
import { ChatRequest, ChatResponse, Chat, ChatsResponse, ChatHistoryResponse, ChatMessage, ModelType } from './types';

// Send a chat message to the backend
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
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
export const getChats = async (): Promise<Chat[]> => {
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
export const getChatHistory = async (chatId: string, limit = 50): Promise<ChatMessage[]> => {
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
export const deleteChat = async (chatId: string): Promise<boolean> => {
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
export const updateSystemPrompt = async (chatId: string, systemPrompt: string): Promise<boolean> => {
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
export const sendMessage = async (
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

// Fix missing axios import
import axios from 'axios';
