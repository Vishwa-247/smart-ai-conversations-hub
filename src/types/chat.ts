
export type ModelType = 'phi3:mini' | 'gemini-2.0-flash' | 'grok-2';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  citations?: Citation[];
}

export interface Citation {
  source: string;
  filename: string;
  chunk_index: number;
  similarity: number;
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
  deleteChat: (id: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  updateSystemPrompt: (chatId: string, systemPrompt: string) => Promise<void>;
  getSystemPrompt: (chatId: string) => string | undefined;
  isInitialLoading?: boolean;
}
