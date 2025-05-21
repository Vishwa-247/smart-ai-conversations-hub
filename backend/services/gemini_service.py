
import time
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API key from environment variables or hardcoded for development
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyD7H1yePFJWYW3zdtk7LktQz7WpBfU9LLc")

# Use the correct model name
GEMINI_MODEL = "gemini-pro"

# Configure the Gemini API
try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Successfully configured Gemini API")
except Exception as e:
    print(f"Error configuring Gemini API: {str(e)}")
    raise

def ask_gemini(messages):
    try:
        print("Starting Gemini request...")
        # Create the model instance
        model = genai.GenerativeModel(GEMINI_MODEL)
        print("Model instance created")
        
        # Extract the system message if it exists
        system_message = next((msg["content"] for msg in messages if msg["role"] == "system"), None)
        print(f"System message found: {'Yes' if system_message else 'No'}")
        
        # Format conversation as a Gemini chat
        gemini_chat = model.start_chat()
        
        formatted_content = ""
        
        # Add system message at the beginning if it exists
        if system_message:
            formatted_content += f"SYSTEM: {system_message}\n\n"
        
        # Add the conversation history
        for msg in messages:
            if msg["role"] != "system":  # Skip system message as we've already handled it
                formatted_content += f"{msg['role'].upper()}: {msg['content']}\n\n"
        
        print(f"Prompt length: {len(formatted_content)} characters")
        
        # Generate response with timeout
        print("Sending request to Gemini API...")
        start_time = time.time()
        
        response = model.generate_content(
            formatted_content,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )
        
        end_time = time.time()
        print(f"Request completed in {end_time - start_time:.2f} seconds")
        
        if not response.text:
            print("Warning: Empty response received from Gemini API")
            raise Exception("Empty response from Gemini API")
            
        print(f"Response length: {len(response.text)} characters")
        return response.text
        
    except Exception as e:
        print(f"Detailed error in Gemini service: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise Exception(f"Failed to get response from Gemini: {str(e)}")
