
// Base types for API communication
export type ModelType = 'phi3:mini' | 'gemini-2.0-flash';

export interface ChatRequest {
  model: ModelType;
  message: string;
  conversation_id?: string;
  system_prompt?: string;
  use_rag?: boolean;
  files?: File[];
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
  conversation_id: string;
  model_used?: string;
  citations?: Citation[];
  reasoning?: string;
  response: string; // Alias for content to match backend
}

export interface Citation {
  source: string;
  filename: string;
  chunk_index: number;
  similarity: number;
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

export interface CustomModel {
  name: string;
  displayName: string;
}
