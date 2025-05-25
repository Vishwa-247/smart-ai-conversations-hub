
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
            print(f"🔍 Checking Ollama availability at {self.base_url}...")
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            available = response.status_code == 200
            print(f"📊 Ollama availability: {available}")
            return available
        except Exception as e:
            print(f"❌ Ollama not available: {e}")
            return False
    
    def get_installed_models(self) -> List[str]:
        """Get list of installed models"""
        try:
            if not self.is_available():
                print("⚠️ Ollama not available, returning empty model list")
                return []
            
            print("📋 Fetching installed models...")
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                models_data = response.json()
                models = [model["name"] for model in models_data.get("models", [])]
                print(f"✅ Found {len(models)} installed models: {models}")
                return models
            return []
        except Exception as e:
            print(f"❌ Error getting models: {e}")
            return []
    
    def pull_model(self, model_name: str) -> bool:
        """Pull a model if not already installed"""
        try:
            print(f"⬇️ Pulling model {model_name}...")
            response = requests.post(
                f"{self.base_url}/api/pull",
                json={"name": model_name},
                stream=True,
                timeout=300
            )
            
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    status = data.get("status", "unknown")
                    print(f"   Pulling {model_name}: {status}")
                    if status == "success":
                        print(f"✅ Model {model_name} pulled successfully")
                        return True
            
            return False
        except Exception as e:
            print(f"❌ Error pulling model {model_name}: {e}")
            return False
    
    def generate_response(self, messages: List[Dict], model: str = "phi3:mini") -> str:
        """Generate response using Ollama"""
        try:
            print(f"🟠 Starting Ollama generation with {model}...")
            
            if not self.is_available():
                raise Exception("Ollama service is not available. Please ensure Ollama is installed and running.")
            
            # Check if model is installed
            installed_models = self.get_installed_models()
            if model not in installed_models:
                print(f"📥 Model {model} not installed, attempting to pull...")
                if not self.pull_model(model):
                    raise Exception(f"Failed to install model {model}. Please install it manually using 'ollama pull {model}'")
            
            # Format messages for Ollama
            formatted_content = ""
            for msg in messages:
                if msg["role"] == "system":
                    formatted_content += f"System: {msg['content']}\n\n"
                elif msg["role"] == "user":
                    formatted_content += f"User: {msg['content']}\n\n"
                elif msg["role"] == "assistant":
                    formatted_content += f"Assistant: {msg['content']}\n\n"
            
            formatted_content += "Assistant:"
            
            print(f"🟠 Sending request to Ollama with model {model}")
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": formatted_content,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "top_k": 40,
                        "num_ctx": 4096
                    }
                },
                timeout=120
            )
            
            end_time = time.time()
            print(f"🟠 Ollama request completed in {end_time - start_time:.2f} seconds")
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "No response generated")
                print(f"✅ Ollama response generated: {len(generated_text)} characters")
                return generated_text
            else:
                print(f"❌ Ollama API error: {response.status_code}")
                print(f"Error details: {response.text}")
                raise Exception(f"Ollama API error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error in Ollama service: {e}")
            raise Exception(f"Ollama generation failed: {str(e)}")

def ask_ollama(messages: List[Dict], model: str = "phi3:mini") -> str:
    """Main function to ask Ollama for a response"""
    service = OllamaService()
    return service.generate_response(messages, model)
