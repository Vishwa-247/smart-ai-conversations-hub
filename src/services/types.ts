
export type ModelType = 'phi3:mini' | 'gemini-2.0-flash' | 'groq-llama';

export interface ChatRequest {
  model: ModelType;
  message: string;
  conversation_id?: string;
  system_prompt?: string;
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
  conversation_id: string;
  model_used?: string;
}

export interface Chat {
  _id: string;
  id?: string;
  title: string;
  model: ModelType;
  created_at: string;
  updated_at: string;
  system_prompt?: string;
}

export interface ChatsResponse {
  chats: Chat[];
}

export interface ChatMessage {
  _id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}
