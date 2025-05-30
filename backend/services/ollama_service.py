
import requests
import json
import time
import os
from typing import List, Dict, Any

class OllamaService:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.available_models = ["phi3:mini", "llama3.2:1b", "llama3.2:3b"]
        
    def is_available(self) -> bool:
        """Check if Ollama is running and available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except Exception as e:
            print(f"Ollama not available: {e}")
            return False
    
    def get_installed_models(self) -> List[str]:
        """Get list of installed models"""
        try:
            if not self.is_available():
                return []
            
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models_data = response.json()
                return [model["name"] for model in models_data.get("models", [])]
            return []
        except Exception as e:
            print(f"Error getting models: {e}")
            return []
    
    def pull_model(self, model_name: str) -> bool:
        """Pull a model if not already installed"""
        try:
            response = requests.post(
                f"{self.base_url}/api/pull",
                json={"name": model_name},
                stream=True,
                timeout=300
            )
            
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if data.get("status") == "success":
                        return True
                    print(f"Pulling {model_name}: {data.get('status', 'unknown')}")
            
            return False
        except Exception as e:
            print(f"Error pulling model {model_name}: {e}")
            return False
    
    def generate_response(self, messages: List[Dict], model: str = "phi3:mini") -> str:
        """Generate response using Ollama with optimized settings"""
        try:
            if not self.is_available():
                raise Exception("Ollama service is not available. Please ensure Ollama is running on localhost:11434")
            
            # Check if model is installed
            installed_models = self.get_installed_models()
            if model not in installed_models:
                print(f"Model {model} not installed, attempting to pull...")
                if not self.pull_model(model):
                    raise Exception(f"Failed to install model {model}. Please run: ollama pull {model}")
            
            # Format messages for Ollama with better context handling
            formatted_content = ""
            for msg in messages:
                if msg["role"] == "system":
                    formatted_content += f"System: {msg['content']}\n\n"
                elif msg["role"] == "user":
                    formatted_content += f"User: {msg['content']}\n\n"
                elif msg["role"] == "assistant":
                    formatted_content += f"Assistant: {msg['content']}\n\n"
            
            formatted_content += "Assistant:"
            
            print(f"Sending request to Ollama with model {model}")
            start_time = time.time()
            
            # Optimized parameters for faster response
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": formatted_content,
                    "stream": False,
                    "options": {
                        "temperature": 0.6,  # Slightly lower for consistency
                        "top_p": 0.8,        # Reduced for faster generation
                        "top_k": 20,         # Reduced for faster generation
                        "num_ctx": 2048,     # Reduced context window for speed
                        "num_predict": 512,  # Limit response length for speed
                        "repeat_penalty": 1.1,
                        "num_thread": -1     # Use all available threads
                    }
                },
                timeout=60  # Reduced timeout
            )
            
            end_time = time.time()
            print(f"Ollama request completed in {end_time - start_time:.2f} seconds")
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "No response generated")
                print(f"Generated response length: {len(generated_text)} characters")
                return generated_text
            else:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Error in Ollama service: {e}")
            raise Exception(f"Ollama generation failed: {str(e)}")

def ask_ollama(messages: List[Dict], model: str = "phi3:mini") -> str:
    """Main function to ask Ollama for a response"""
    service = OllamaService()
    return service.generate_response(messages, model)
