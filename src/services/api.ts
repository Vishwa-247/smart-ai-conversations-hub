const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

class ApiService {
  async sendMessage(
    conversationId: string,
    message: string,
    model: string,
    systemPrompt?: string,
    files?: File[]
  ) {
    // Check if trying to use Ollama on mobile
    if (model.includes('phi3') || model.includes('ollama')) {
      if (isMobile()) {
        throw new Error("Ollama models are not available on mobile devices. Please use Gemini or Groq models instead.");
      }
    }

    // If files are provided, upload them first
    if (files && files.length > 0) {
      for (const file of files) {
        await this.uploadDocument(file, conversationId);
      }
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        message,
        conversation_id: conversationId || undefined,
        system_prompt: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to send message");
    }

    const data = await response.json();
    
    // Log agent responses for debugging
    if (data.agent_response) {
      console.log("🤖 Agent response detected:", data.agent_response);
    }
    
    return data;
  }

  async createChat(model: string, title: string, systemPrompt?: string) {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Date.now().toString(),
        title,
        model,
        system_prompt: systemPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    return response.json();
  }

  async getChats() {
    const response = await fetch(`${API_BASE_URL}/chats`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    const data = await response.json();
    // Return the chats array directly from the response
    return data.chats || [];
  }

  async getChatHistory(chatId: string, limit = 50) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    const data = await response.json();
    // Return the messages array directly from the response
    return data.messages || [];
  }

  async deleteChat(chatId: string) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete chat");
    }

    return response.json();
  }

  async updateSystemPrompt(chatId: string, systemPrompt: string) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/system-prompt`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_prompt: systemPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update system prompt");
    }

    return response.json();
  }

  async saveMessage(chatId: string, role: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save message");
    }

    return response.json();
  }

  async generateTitle(content: string, model: string = "groq-llama") {
    const response = await fetch(`${API_BASE_URL}/generate-title`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate title");
    }

    return response.json();
  }

  async uploadDocument(file: File, chatId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chat_id", chatId);

    const response = await fetch(`${API_BASE_URL}/upload-document`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    return response.json();
  }

  async scrapeUrl(url: string) {
    const response = await fetch(`${API_BASE_URL}/scrape-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to scrape URL");
    }

    return response.json();
  }

  async webSearch(query: string, maxResults: number = 5) {
    const response = await fetch(`${API_BASE_URL}/web-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to perform web search");
    }

    return response.json();
  }
}

export const apiService = new ApiService();

// Make it available globally for legacy code
(window as any).apiService = apiService;
