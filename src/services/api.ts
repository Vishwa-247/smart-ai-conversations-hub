
import axios from 'axios';
import { Message, ModelType } from '@/contexts/ChatContext';

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse {
  role: 'assistant';
  content: string;
  conversation_id?: string;
}

export const apiService = {
  async sendMessage(chatId: string, message: string, model: ModelType): Promise<ApiResponse> {
    try {
      console.log(`Sending message to ${model}: ${message}`);
      
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        conversation_id: chatId,
        message,
        model
      });

      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  },

  async getChats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats`);
      return response.data.chats;
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      throw error;
    }
  },

  async getChatHistory(chatId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${chatId}`);
      return response.data.messages;
    } catch (error) {
      console.error(`Failed to fetch chat history for ${chatId}:`, error);
      throw error;
    }
  },

  async deleteChat(chatId: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete chat ${chatId}:`, error);
      throw error;
    }
  }
};
