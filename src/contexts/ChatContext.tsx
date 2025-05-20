import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, ModelType as ApiModelType } from '@/services/api';

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
  systemPrompt?: string;
}

interface ChatContextType {
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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelType>('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);

  // Create a new chat with the specified model
  const createChat = (model: ModelType, systemPrompt?: string) => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
      systemPrompt,
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
      // Check if the chat already exists
      const existingChat = prev.find((chat) => chat.id === chatId);
      
      if (existingChat) {
        // Update existing chat
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
      } else {
        // Create a new chat with this message
        const title = message.role === 'user' ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '') : 'New Chat';
        
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        
        const newChat: Chat = {
          id: chatId,
          title,
          messages: [newMessage],
          model: currentModel,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Set this as the current chat
        setCurrentChatId(chatId);
        
        // Add the new chat to the beginning of the list
        return [newChat, ...prev.filter(chat => chat.id !== chatId)];
      }
    });
  };

  // Delete a chat
  const deleteChat = async (id: string) => {
    try {
      // Try to delete from the backend first
      await apiService.deleteChat(id);
      
      // Then update the local state
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
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Update system prompt for a specific chat
  const updateSystemPrompt = (chatId: string, systemPrompt: string) => {
    setChats((prev) => {
      return prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            systemPrompt,
            updatedAt: new Date(),
          };
        }
        return chat;
      });
    });
  };
  
  // Get system prompt for a specific chat
  const getSystemPrompt = (chatId: string): string | undefined => {
    const chat = chats.find((c) => c.id === chatId);
    return chat?.systemPrompt;
  };

  // Instead of automatically creating a chat, just set the current model
  useEffect(() => {
    if (chats.length === 0) {
      setCurrentChatId(null);
    }
  }, []);

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
    updateSystemPrompt,
    getSystemPrompt,
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
