import { apiClient } from './apiClient';
import { ModelType, ChatRequest, ChatResponse, Chat, ChatMessage } from './types';

// Enhanced sendMessage function with RAG integration
export const sendMessage = async (
  conversationId: string,
  message: string,
  model: ModelType,
  systemPrompt?: string,
  files?: File[]
): Promise<ChatResponse> => {
  try {
    console.log('Sending message with RAG integration:', {
      conversationId,
      model,
      hasFiles: !!files?.length,
      hasSystemPrompt: !!systemPrompt
    });

    const formData = new FormData();
    formData.append('message', message);
    formData.append('model', model);
    formData.append('use_rag', 'true'); // Always use RAG if documents available
    
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }
    
    if (systemPrompt) {
      formData.append('system_prompt', systemPrompt);
    }

    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }

    const response = await apiClient.post('/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for large files
    });

    console.log('Chat response received:', {
      role: response.data.role,
      hasContent: !!response.data.content,
      conversationId: response.data.conversation_id,
      hasCitations: !!response.data.citations?.length
    });

    return {
      role: 'assistant',
      content: response.data.content || response.data.response,
      conversation_id: response.data.conversation_id,
      model_used: response.data.model_used,
      citations: response.data.citations,
      reasoning: response.data.reasoning,
      response: response.data.content || response.data.response,
    };
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send message');
  }
};

export const sendChatMessage = async (
  message: string,
  model: ModelType,
  conversationId?: string,
  systemPrompt?: string,
  useRag: boolean = false,
  files?: File[]
): Promise<ChatResponse> => {
  const requestData: ChatRequest = {
    model,
    message,
    conversation_id: conversationId,
    system_prompt: systemPrompt,
    use_rag: useRag,
  };

  try {
    const response = await apiClient.post<ChatResponse>('/chat', requestData, {
      timeout: 60000,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send message');
  }
};

export const getChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get<Chat[]>('/chats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chats');
  }
};

export const getChatHistory = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get<ChatMessage[]>(`/chat/${chatId}/history`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chat history');
  }
};

export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await apiClient.delete(`/chat/${chatId}`);
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete chat');
  }
};

export const updateSystemPrompt = async (chatId: string, systemPrompt: string): Promise<void> => {
  try {
    await apiClient.put(`/chat/${chatId}/system_prompt`, { system_prompt: systemPrompt });
  } catch (error: any) {
    console.error('Error updating system prompt:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update system prompt');
  }
};
