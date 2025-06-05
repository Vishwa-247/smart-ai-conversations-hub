
import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Chat, ChatContextType, Message, ModelType } from '@/types/chat';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelType>('phi3:mini');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load existing chats on app startup
  useEffect(() => {
    const loadChats = async () => {
      try {
        console.log('Loading existing chats from backend...');
        const existingChats = await apiService.getChats();
        
        // Convert backend chat format to frontend format
        const formattedChats: Chat[] = existingChats.map(chat => ({
          id: chat._id || chat.id || '',
          title: chat.title,
          messages: [], // Messages will be loaded when chat is selected
          model: chat.model,
          createdAt: new Date(chat.created_at),
          updatedAt: new Date(chat.updated_at),
          systemPrompt: chat.system_prompt,
        }));
        
        setChats(formattedChats);
        console.log(`Loaded ${formattedChats.length} chats from backend`);
        
        // Try to restore the last selected chat from localStorage
        const lastChatId = localStorage.getItem('lastSelectedChatId');
        if (lastChatId && formattedChats.find(chat => chat.id === lastChatId)) {
          setCurrentChatId(lastChatId);
          const chat = formattedChats.find(c => c.id === lastChatId);
          if (chat) {
            setCurrentModel(chat.model);
            // Load messages for the restored chat
            await loadChatMessages(lastChatId);
          }
        }
        
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadChats();
  }, []);

  // Save current chat ID to localStorage when it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('lastSelectedChatId', currentChatId);
    } else {
      localStorage.removeItem('lastSelectedChatId');
    }
  }, [currentChatId]);

  // Load messages for a specific chat
  const loadChatMessages = async (chatId: string) => {
    try {
      console.log(`Loading messages for chat ${chatId}`);
      const messages = await apiService.getChatHistory(chatId);
      
      // Convert backend message format to frontend format
      const formattedMessages: Message[] = messages.map(msg => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        model: undefined, // Backend doesn't store this
      }));
      
      // Update the chat with loaded messages
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: formattedMessages }
          : chat
      ));
      
      console.log(`Loaded ${formattedMessages.length} messages for chat ${chatId}`);
    } catch (error) {
      console.error(`Failed to load messages for chat ${chatId}:`, error);
    }
  };

  // Generate title for chat based on content
  const generateChatTitle = async (content: string, model: ModelType): Promise<string> => {
    try {
      const response = await apiService.generateTitle(content, model);
      return response.title || 'New Chat';
    } catch (error) {
      console.error('Failed to generate title:', error);
      return content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }
  };

  // Create a new chat with the specified model and save to backend immediately
  const createChat = async (model: ModelType, systemPrompt?: string) => {
    try {
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
      
      // Save to backend immediately to ensure persistence
      await apiService.createChat(model, 'New Chat', systemPrompt);
      
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      setCurrentModel(model);
      
      console.log(`Created new chat with ID: ${newChatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Select an existing chat and load its messages
  const selectChat = async (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setCurrentModel(chat.model);
      
      // Load messages if not already loaded
      if (chat.messages.length === 0) {
        await loadChatMessages(id);
      }
      
      console.log(`Selected chat: ${id}`);
    }
  };

  // Add a message to a specific chat and save to backend
  const addMessage = async (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      setChats((prev) => {
        const existingChat = prev.find((chat) => chat.id === chatId);
        
        if (existingChat) {
          // Update existing chat
          return prev.map((chat) => {
            if (chat.id === chatId) {
              const shouldUpdateTitle = chat.title === 'New Chat' && message.role === 'user' && chat.messages.length === 0;
              
              const newMessage: Message = {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date(),
              };
              
              // Generate new title if needed
              if (shouldUpdateTitle) {
                generateChatTitle(message.content, chat.model).then(newTitle => {
                  setChats(prevChats => prevChats.map(c => 
                    c.id === chatId ? { ...c, title: newTitle } : c
                  ));
                });
              }
              
              // Save to backend - use the correct API method
              if (message.role === 'user' || message.role === 'assistant') {
                apiService.saveMessage(chatId, message.role, message.content).catch(console.error);
              }
              
              return {
                ...chat,
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
          
          // Save to backend
          apiService.createChat(currentModel, title).catch(console.error);
          if (message.role === 'user' || message.role === 'assistant') {
            apiService.saveMessage(chatId, message.role, message.content).catch(console.error);
          }
          
          setCurrentChatId(chatId);
          return [newChat, ...prev.filter(chat => chat.id !== chatId)];
        }
      });
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  // Update a specific message in a chat
  const updateMessage = (chatId: string, messageIndex: number, updatedMessage: Message) => {
    setChats((prev) => {
      return prev.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages];
          updatedMessages[messageIndex] = updatedMessage;
          return {
            ...chat,
            messages: updatedMessages,
            updatedAt: new Date(),
          };
        }
        return chat;
      });
    });
  };

  // Delete a chat
  const deleteChat = async (id: string) => {
    try {
      await apiService.deleteChat(id);
      
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      
      if (currentChatId === id) {
        const remainingChats = chats.filter((chat) => chat.id !== id);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
          setCurrentModel(remainingChats[0].model);
          // Load messages for the new current chat
          await loadChatMessages(remainingChats[0].id);
        } else {
          setCurrentChatId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Update system prompt for a specific chat
  const updateSystemPrompt = async (chatId: string, systemPrompt: string) => {
    try {
      // Update locally first
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
      
      // Then update on server
      await apiService.updateSystemPrompt(chatId, systemPrompt);
    } catch (error) {
      console.error("Error updating system prompt:", error);
      throw error;
    }
  };
  
  // Get system prompt for a specific chat
  const getSystemPrompt = (chatId: string): string | undefined => {
    const chat = chats.find((c) => c.id === chatId);
    return chat?.systemPrompt;
  };

  const value = {
    chats,
    currentChatId,
    currentModel,
    setCurrentModel,
    createChat,
    selectChat,
    addMessage,
    updateMessage,
    deleteChat,
    isLoading,
    setIsLoading,
    updateSystemPrompt,
    getSystemPrompt,
    isInitialLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export default ChatContext;
