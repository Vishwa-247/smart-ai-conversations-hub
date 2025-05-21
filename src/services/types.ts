
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

export interface ChatRequest {
  model: ModelType;
  message: string;
  conversation_id?: string;
  custom_model?: CustomModel;
  system_prompt?: string;
  files?: File[];
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  role?: 'assistant';
  content?: string;
  error?: string;
}

export interface Chat {
  _id: string;
  user_id: string;
  title: string;
  model: ModelType;
  created_at: string;
  updated_at: string;
  system_prompt?: string;
}

export interface ChatsResponse {
  chats: Chat[];
  error?: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  error?: string;
}
