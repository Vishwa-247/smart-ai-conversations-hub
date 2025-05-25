
import os
import requests
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API key from environment variables
GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

def ask_grok(messages):
    """Send message to Grok API and return response"""
    try:
        print("🟡 Starting Grok API request...")
        
        if not GROK_API_KEY:
            print("⚠️ Grok API key not configured")
            return "Grok API key not configured. Please set GROK_API_KEY in environment variables."
        
        # Format messages for Grok API (similar to OpenAI format)
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": formatted_messages,
            "model": "grok-2-1212",
            "stream": False,
            "temperature": 0.7,
            "max_tokens": 2048
        }
        
        print(f"🟡 Sending request to Grok API with {len(formatted_messages)} messages")
        start_time = time.time()
        
        response = requests.post(
            GROK_API_URL,
            headers=headers,
            json=payload,
            timeout=120
        )
        
        end_time = time.time()
        print(f"🟡 Grok API request completed in {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("choices") and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                print(f"✅ Grok response received: {len(content)} characters")
                return content
            else:
                print("⚠️ No choices in Grok response")
                return "No response generated from Grok"
        else:
            print(f"❌ Grok API error: {response.status_code}")
            print(f"Error details: {response.text}")
            if response.status_code == 401:
                return "Grok API authentication failed. Please check your API key."
            elif response.status_code == 429:
                return "Grok API rate limit exceeded. Please try again later."
            else:
                return f"Grok API error: {response.status_code}. Please try again."
            
    except requests.exceptions.Timeout:
        print("⏰ Grok API request timed out")
        return "Grok API request timed out. Please try again."
    except requests.exceptions.ConnectionError:
        print("🔌 Cannot connect to Grok API")
        return "Cannot connect to Grok API. Please check your internet connection."
    except Exception as e:
        print(f"💥 Error in Grok service: {str(e)}")
        return f"An error occurred with Grok API: {str(e)}"
