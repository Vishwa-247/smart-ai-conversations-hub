
import os
import time
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def ask_openai(messages, model="gpt-4o"):
    """Send message to OpenAI and return response"""
    try:
        print(f"Starting OpenAI request with model: {model}")
        if not OPENAI_API_KEY:
            return "OpenAI API key not configured. Please set OPENAI_API_KEY in .env file."
        
        openai.api_key = OPENAI_API_KEY
        
        start_time = time.time()
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0,
        )
        end_time = time.time()
        print(f"Request completed in {end_time - start_time:.2f} seconds")
        
        return response.choices[0].message["content"]
    except Exception as e:
        print(f"Error in OpenAI service: {str(e)}")
        return f"An error occurred with OpenAI: {str(e)}"
