
import axios from 'axios';

// API base URL - use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API_BASE_URL:', API_BASE_URL);

// API client instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('Request data:', JSON.stringify(config.data).substring(0, 200) + '...');
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    console.log('Response data:', JSON.stringify(response.data).substring(0, 200) + '...');
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else if (error.request) {
      console.error('No Response Received. Is the server running?');
    } else {
      console.error('Error Message:', error.message);
    }
    
    // Return a meaningful error to the UI
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    } else if (!error.response) {
      return Promise.reject(new Error('Cannot reach the server. Please check your connection.'));
    } else if (error.response.status === 401) {
      return Promise.reject(new Error('Authentication failed. Please check your API keys.'));
    } else {
      return Promise.reject(error);
    }
  }
);
