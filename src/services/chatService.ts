
import { apiClient } from './apiClient';
import { ChatRequest, ChatResponse, Chat, ChatsResponse, ChatHistoryResponse, ChatMessage, ModelType } from './types';

const API_TIMEOUT = 30000;

export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log('📨 Sending chat request:', request);
    
    const response = await apiClient.post<ChatResponse>('/chat', request, {
      timeout: API_TIMEOUT
    });
    
    console.log('✅ Response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in sendChatMessage:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send message');
  }
};

export const getChats = async (): Promise<Chat[]> => {
  try {
    console.log('📚 Fetching chats from backend...');
    const response = await apiClient.get<ChatsResponse>('/chats');
    console.log(`✅ Loaded ${response.data.chats?.length || 0} chats`);
    return response.data.chats || [];
  } catch (error: any) {
    console.error('❌ Error in getChats:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chats');
  }
};

export const getChatHistory = async (chatId: string, limit = 50): Promise<ChatMessage[]> => {
  try {
    console.log(`📖 Fetching chat history for ${chatId}...`);
    const response = await apiClient.get<ChatHistoryResponse>(`/chats/${chatId}?limit=${limit}`);
    console.log(`✅ Loaded ${response.data.messages?.length || 0} messages`);
    return response.data.messages || [];
  } catch (error: any) {
    console.error('❌ Error in getChatHistory:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chat history');
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deleting chat ${chatId}...`);
    const response = await apiClient.delete(`/chats/${chatId}`);
    console.log("✅ Chat deleted:", response.data);
    return response.data.success;
  } catch (error: any) {
    console.error("❌ Error deleting chat:", error);
    throw new Error(error.response?.data?.detail || 'Failed to delete chat');
  }
};

export const updateSystemPrompt = async (chatId: string, systemPrompt: string): Promise<boolean> => {
  try {
    console.log(`⚙️ Updating system prompt for ${chatId}`);
    const response = await apiClient.patch(`/chats/${chatId}/system-prompt`, {
      system_prompt: systemPrompt
    });
    console.log("✅ System prompt updated:", response.data);
    return response.data.success;
  } catch (error: any) {
    console.error("❌ Error updating system prompt:", error);
    throw new Error(error.response?.data?.detail || 'Failed to update system prompt');
  }
};

export const sendMessage = async (
  chatId: string,
  message: string,
  model: ModelType,
  systemPrompt?: string,
  files?: File[]
): Promise<{ role: 'assistant', content: string, conversation_id?: string }> => {
  
  console.log(`🚀 Sending message with ${model}:`, {
    chatId,
    messageLength: message.length,
    hasSystemPrompt: !!systemPrompt,
    filesCount: files?.length || 0
  });
  
  const request: ChatRequest = {
    model,
    message,
    conversation_id: chatId || undefined,
    system_prompt: systemPrompt,
  };

  const response = await sendChatMessage(request);
  
  return {
    role: 'assistant',
    content: response.content,
    conversation_id: response.conversation_id
  };
};
