
import time
import google.generativeai as genai

# Hardcoded API key (not recommended for production, but for debugging)
GEMINI_API_KEY = "AIzaSyD7H1yePFJWYW3zdtk7LktQz7WpBfU9LLc"

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
        
        # Format the conversation history
        formatted_messages = []
        for msg in messages:
            if msg["role"] == "system":
                continue  # Skip system message as it's handled separately
            formatted_messages.append(f"{msg['role'].upper()}: {msg['content']}")
        
        # Combine all messages into a single prompt
        prompt = "\n".join(formatted_messages)
        print(f"Prompt length: {len(prompt)} characters")
        
        # Generate response with timeout
        print("Sending request to Gemini API...")
        start_time = time.time()
        response = model.generate_content(
            prompt,
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
