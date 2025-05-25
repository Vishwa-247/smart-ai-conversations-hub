
interface LocalChat {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  system_prompt?: string;
  messages: LocalMessage[];
}

interface LocalMessage {
  _id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

class LocalDBService {
  private readonly CHATS_KEY = 'local_chats';
  private readonly MESSAGES_KEY = 'local_messages';

  // Initialize local database
  initialize(): boolean {
    try {
      if (!localStorage.getItem(this.CHATS_KEY)) {
        localStorage.setItem(this.CHATS_KEY, JSON.stringify([]));
      }
      if (!localStorage.getItem(this.MESSAGES_KEY)) {
        localStorage.setItem(this.MESSAGES_KEY, JSON.stringify([]));
      }
      console.log('Local database initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      return false;
    }
  }

  // Get all chats
  getChats(): LocalChat[] {
    try {
      const chats = localStorage.getItem(this.CHATS_KEY);
      return chats ? JSON.parse(chats) : [];
    } catch (error) {
      console.error('Failed to get chats from local DB:', error);
      return [];
    }
  }

  // Save chat
  saveChat(chat: Omit<LocalChat, 'messages'>): boolean {
    try {
      const chats = this.getChats();
      const existingIndex = chats.findIndex(c => c.id === chat.id);
      
      if (existingIndex >= 0) {
        chats[existingIndex] = { ...chats[existingIndex], ...chat };
      } else {
        chats.unshift({ ...chat, messages: [] });
      }
      
      localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
      return true;
    } catch (error) {
      console.error('Failed to save chat to local DB:', error);
      return false;
    }
  }

  // Get messages for a chat
  getChatMessages(chatId: string): LocalMessage[] {
    try {
      const messages = localStorage.getItem(this.MESSAGES_KEY);
      const allMessages: LocalMessage[] = messages ? JSON.parse(messages) : [];
      return allMessages.filter(msg => msg.chat_id === chatId);
    } catch (error) {
      console.error('Failed to get messages from local DB:', error);
      return [];
    }
  }

  // Save message
  saveMessage(message: LocalMessage): boolean {
    try {
      const messages = localStorage.getItem(this.MESSAGES_KEY);
      const allMessages: LocalMessage[] = messages ? JSON.parse(messages) : [];
      allMessages.push(message);
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(allMessages));
      return true;
    } catch (error) {
      console.error('Failed to save message to local DB:', error);
      return false;
    }
  }

  // Delete chat and its messages
  deleteChat(chatId: string): boolean {
    try {
      // Remove chat
      const chats = this.getChats();
      const filteredChats = chats.filter(chat => chat.id !== chatId);
      localStorage.setItem(this.CHATS_KEY, JSON.stringify(filteredChats));

      // Remove messages
      const messages = localStorage.getItem(this.MESSAGES_KEY);
      const allMessages: LocalMessage[] = messages ? JSON.parse(messages) : [];
      const filteredMessages = allMessages.filter(msg => msg.chat_id !== chatId);
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(filteredMessages));

      return true;
    } catch (error) {
      console.error('Failed to delete chat from local DB:', error);
      return false;
    }
  }
}

export const localDBService = new LocalDBService();
