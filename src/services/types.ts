
export type ModelType = 'gemini-pro' | 'grok-1' | 'mistral-7b' | 'phi-3-mini';

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
  role: 'assistant';
  response: string;
  conversation_id: string;
  model_used?: string;
  citations?: Array<{
    source: string;
    filename: string;
    chunk_index: number;
    similarity: number;
  }>;
  reasoning?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  filename: string;
  chunk_count?: number;
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
