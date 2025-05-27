
// Re-export everything from our modular services
import { apiClient } from './apiClient';
import {
  sendChatMessage,
  getChats,
  getChatHistory,
  deleteChat,
  sendMessage,
  updateSystemPrompt,
} from './chatService';
import { ModelType, ChatMessage } from './types';

// Export API functions as a service object
export const apiService = {
  sendChatMessage,
  getChats,
  getChatHistory,
  deleteChat,
  sendMessage,
  updateSystemPrompt,
};

// Also export individual functions for compatibility
export {
  sendChatMessage,
  getChats,
  getChatHistory,
  deleteChat,
  sendMessage,
  updateSystemPrompt,
};

// Re-export types
export type { ModelType, ChatMessage };
