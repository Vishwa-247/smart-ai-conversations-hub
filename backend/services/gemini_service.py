
import time
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API key from environment variables with new key as fallback
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyC0sKQhg3sqDJXQUxK8_om4FfQY1884NXM")

# Use the correct model name for Gemini 2.0 Flash
GEMINI_MODEL = "gemini-2.0-flash"

# Configure the Gemini API
def ask_gemini(messages):
    """Send message to Gemini and return response"""
    try:
        if not GEMINI_API_KEY:
            print("Warning: GEMINI_API_KEY environment variable not set")
            return "Gemini API key not configured. Please set GEMINI_API_KEY in .env file."
            
        print("Starting Gemini request...")
        # Configure the API with the new key
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Create the model instance with the correct model name
        model = genai.GenerativeModel(GEMINI_MODEL)
        print("Model instance created")
        
        # Extract the system message if it exists
        system_message = next((msg["content"] for msg in messages if msg["role"] == "system"), None)
        print(f"System message found: {'Yes' if system_message else 'No'}")
        
        formatted_content = ""
        
        # Add system message at the beginning if it exists
        if system_message:
            formatted_content += f"SYSTEM: {system_message}\n\n"
        
        # Add the conversation history
        for msg in messages:
            if msg["role"] != "system":  # Skip system message as we've already handled it
                formatted_content += f"{msg['role'].upper()}: {msg['content']}\n\n"
        
        print(f"Prompt length: {len(formatted_content)} characters")
        print(f"Using API key: {GEMINI_API_KEY[:10]}...{GEMINI_API_KEY[-5:] if GEMINI_API_KEY else 'None'}")
        
        # Generate response with timeout
        print("Sending request to Gemini API...")
        start_time = time.time()
        
        response = model.generate_content(
            formatted_content,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
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
        return f"An error occurred with Gemini: {str(e)}"
