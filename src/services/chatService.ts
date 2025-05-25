
import { apiClient } from './apiClient';
import { ChatRequest, ChatResponse, Chat, ChatsResponse, ChatHistoryResponse, ChatMessage, ModelType } from './types';
import { callGeminiAPI } from './geminiService';

const API_TIMEOUT = 30000;

const createTimeoutPromise = (timeout: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log('📨 Sending chat request:', {
      model: request.model,
      messageLength: request.message.length,
      conversationId: request.conversation_id,
      hasSystemPrompt: !!request.system_prompt,
      useRag: request.use_rag,
      filesCount: request.files?.length || 0
    });
    
    if (request.files && request.files.length > 0) {
      console.log(`📎 Preparing to upload ${request.files.length} files`);
    }
    
    const startTime = Date.now();
    const responsePromise = apiClient.post<ChatResponse>('/chat', request);
    const timeoutPromise = createTimeoutPromise(API_TIMEOUT);
    
    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    const endTime = Date.now();
    
    console.log(`✅ Response received in ${endTime - startTime}ms:`, {
      model: request.model,
      responseLength: response.data.content?.length || 0,
      conversationId: response.data.conversation_id
    });
    
    if (response.data.content && !response.data.response) {
      response.data.response = response.data.content;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in sendChatMessage:', error);
    if (error.message === 'Request timeout') {
      throw new Error(`Request timed out for ${request.model}. The model might be taking longer than usual to respond.`);
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
    console.log('📚 Fetching chats from backend...');
    const response = await apiClient.get<ChatsResponse>('/chats');
    console.log(`✅ Loaded ${response.data.chats?.length || 0} chats`);
    return response.data.chats || [];
  } catch (error: any) {
    console.error('❌ Error in getChats:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch chats');
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
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to fetch chat history');
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
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to delete chat');
  }
};

export const updateSystemPrompt = async (chatId: string, systemPrompt: string): Promise<boolean> => {
  try {
    console.log(`⚙️ Updating system prompt for ${chatId}:`, systemPrompt.slice(0, 100) + '...');
    const response = await apiClient.patch(`/chats/${chatId}/system-prompt`, {
      system_prompt: systemPrompt
    });
    console.log("✅ System prompt updated:", response.data);
    return response.data.success;
  } catch (error: any) {
    console.error("❌ Error updating system prompt:", error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(error.message || 'Failed to update system prompt');
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
  
  if (model === 'gemini-2.0-flash') {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system' as const, content: systemPrompt });
      }
      
      messages.push({ role: 'user' as const, content: message });
      
      console.log('🟢 Calling Gemini API directly...');
      const geminiPromise = callGeminiAPI(messages);
      const timeoutPromise = createTimeoutPromise(API_TIMEOUT);
      
      const response = await Promise.race([geminiPromise, timeoutPromise]) as string;
      console.log('✅ Gemini response received');
      
      return {
        role: 'assistant',
        content: response,
        conversation_id: chatId || `gemini_${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ Gemini API error:', error);
      if (error.message === 'Request timeout') {
        throw new Error('Gemini API timed out. Please try again.');
      }
      throw new Error('Failed to get response from Gemini');
    }
  }

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
