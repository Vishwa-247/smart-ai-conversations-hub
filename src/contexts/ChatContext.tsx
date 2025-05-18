
import React, { createContext, useContext, useState } from 'react';

// Define our models
export type ModelType = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-sonnet' | 'gemini-pro' | 'grok-1';

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
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentModel: ModelType;
  setCurrentModel: (model: ModelType) => void;
  createChat: (model: ModelType) => void;
  selectChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteChat: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelType>('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);

  // Create a new chat with the specified model
  const createChat = (model: ModelType) => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setCurrentModel(model);
  };

  // Select an existing chat
  const selectChat = (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setCurrentModel(chat.model);
    }
  };

  // Add a message to a specific chat
  const addMessage = (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    setChats((prev) => {
      return prev.map((chat) => {
        if (chat.id === chatId) {
          // Auto-name chat based on first user message if it's unnamed
          const shouldUpdateTitle = chat.title === 'New Chat' && message.role === 'user' && chat.messages.length === 0;
          const newTitle = shouldUpdateTitle ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '') : chat.title;
          
          // Add message to chat
          const newMessage: Message = {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date(),
          };
          
          return {
            ...chat,
            title: newTitle,
            messages: [...chat.messages, newMessage],
            updatedAt: new Date(),
          };
        }
        return chat;
      });
    });
  };

  // Delete a chat
  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    
    // If we deleted the current chat, select another one
    if (currentChatId === id) {
      const remainingChats = chats.filter((chat) => chat.id !== id);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
        setCurrentModel(remainingChats[0].model);
      } else {
        setCurrentChatId(null);
      }
    }
  };

  const value = {
    chats,
    currentChatId,
    currentModel,
    setCurrentModel,
    createChat,
    selectChat,
    addMessage,
    deleteChat,
    isLoading,
    setIsLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
