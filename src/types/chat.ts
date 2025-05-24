
// Define our models - updated to include free models
export type ModelType = 'gemini-pro' | 'grok-1' | 'mistral-7b' | 'phi-3-mini';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: ModelType;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: ModelType;
  createdAt: Date;
  updatedAt: Date;
  systemPrompt?: string;
}

export interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentModel: ModelType;
  setCurrentModel: (model: ModelType) => void;
  createChat: (model: ModelType, systemPrompt?: string) => void;
  selectChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteChat: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  updateSystemPrompt: (chatId: string, systemPrompt: string) => void;
  getSystemPrompt: (chatId: string) => string | undefined;
}
