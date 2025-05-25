
import { apiClient } from './apiClient';

export class BackendService {
  private baseURL = 'http://localhost:8000'; // FastAPI backend
  
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseURL}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  async checkOllamaStatus(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseURL}/ollama/status`);
      return response.data.status === 'available';
    } catch (error) {
      console.error('Ollama status check failed:', error);
      return false;
    }
  }

  async initializeLocalDB(): Promise<boolean> {
    try {
      const response = await apiClient.post(`${this.baseURL}/db/initialize`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to initialize local DB:', error);
      return false;
    }
  }

  async validateModels(): Promise<{ phi3: boolean; gemini: boolean; grok: boolean }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/models/validate`);
      return response.data;
    } catch (error) {
      console.error('Model validation failed:', error);
      return { phi3: false, gemini: false, grok: false };
    }
  }
}

export const backendService = new BackendService();
