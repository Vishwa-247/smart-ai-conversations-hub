from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from bson import ObjectId
import json
from datetime import datetime

# Import LLM clients
from llm_clients.openai_client import ask_openai
from llm_clients.gemini_client import ask_gemini
from llm_clients.claude_client import ask_claude

# Import MongoDB client
from db.mongo_client import MongoDB

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000",
                  "http://localhost:8080", "http://127.0.0.1:8080"], supports_credentials=True)

# Initialize MongoDB client
mongo_db = MongoDB()

# System message for AI
system_message = {
    "role": "system",
    "content": (
        "You are Studymate-AI, an expert career coach. "
        "You help users explore career options, choose the right skills, build strong resumes, "
        "prepare for interviews, and plan their professional growth. "
        "Give clear, friendly, and actionable advice tailored to the user's goals. "
        "Explain in simple English, like for a 2nd-grade student."
    )
}

# In-memory conversation cache (temporary, before saving to MongoDB)
conversations_cache = {}

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    print(f"Received request data: {data}")
    model = data.get('model', 'gpt-4o')  # Default to gpt-4o to match frontend
    message = data.get('message', '')
    conversation_id = data.get('conversation_id')
    
    try:
        # Create a new conversation if it doesn't exist
        if not conversation_id:
            print("Creating new conversation...")
            conversation_id = mongo_db.create_chat(model=model, title=message[:30])
            print(f"New conversation created with ID: {conversation_id}")
            # Initialize with system message in cache
            conversations_cache[conversation_id] = [system_message]
        elif conversation_id not in conversations_cache:
            print(f"Loading conversation history for ID: {conversation_id}")
            # Load conversation history from DB to cache
            messages_db = mongo_db.get_chat_history(conversation_id)
            
            # Convert to the format needed by LLM clients
            conversations_cache[conversation_id] = [system_message]  # Always start with system message
            for msg in messages_db:
                conversations_cache[conversation_id].append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add user message to conversation cache
        conversations_cache[conversation_id].append({
            "role": "user",
            "content": message
        })
        
        # Save user message to MongoDB
        print("Saving user message to MongoDB...")
        mongo_db.save_message(conversation_id, "user", message)
        
        # Get response based on selected model
        print(f"Getting response from {model}...")
        if model in ['gpt-4o', 'gpt-4o-mini']:
            response_text = ask_openai(conversations_cache[conversation_id], model)
        elif model == 'gemini-pro':
            response_text = ask_gemini(conversations_cache[conversation_id])
        elif model == 'claude-3-sonnet':
            response_text = ask_claude(conversations_cache[conversation_id])
        else:
            response_text = ask_openai(conversations_cache[conversation_id], "gpt-4o")
        
        print("Response received, saving to MongoDB...")
        # Add assistant response to conversation cache
        conversations_cache[conversation_id].append({
            "role": "assistant",
            "content": response_text
        })
        
        # Save assistant response to MongoDB
        mongo_db.save_message(conversation_id, "assistant", response_text)
        
        return jsonify({
            "role": "assistant",  # Changed to match frontend expectation
            "content": response_text,
            "conversation_id": conversation_id
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Detailed error: {error_details}")
        return jsonify({
            "error": str(e),
            "details": error_details
        }), 500

@app.route('/api/chats', methods=['GET'])
def get_chats():
    try:
        # Get all chats for anonymous user (you can add user authentication later)
        chats = mongo_db.get_all_chats()
        
        # Convert ObjectId to string
        chats_json = json.loads(JSONEncoder().encode(chats))
        
        return jsonify({"chats": chats_json})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chats/<chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    try:
        # Get conversation history
        limit = request.args.get('limit', 50, type=int)
        messages = mongo_db.get_chat_history(chat_id, limit)
        
        # Convert ObjectId to string
        messages_json = json.loads(JSONEncoder().encode(messages))
        
        return jsonify({"messages": messages_json})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    try:
        success = mongo_db.delete_chat(chat_id)
        
        if success:
            # Remove from cache if exists
            if chat_id in conversations_cache:
                del conversations_cache[chat_id]
            
            return jsonify({
                "success": True,
                "message": "Chat deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to delete chat"
            }), 500
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API server is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
