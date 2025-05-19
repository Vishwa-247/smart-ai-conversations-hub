
from datetime import datetime

from database.mongodb import MongoDB
from flask import Blueprint, jsonify, request
from services.claude_service import ask_claude
from services.gemini_service import ask_gemini
from services.grok_service import ask_grok
from services.openai_service import ask_openai

# Initialize MongoDB client
mongo_db = MongoDB()

# Create a blueprint for chat routes
chat_router = Blueprint('chat', __name__, url_prefix='/api')

# In-memory conversation cache (temporary, before saving to MongoDB)
conversations_cache = {}

# System message for AI
system_message = {
    "role": "system",
    "content": (
        "You are an AI assistant that provides helpful, accurate, and friendly responses. "
        "Answer user questions clearly and concisely, providing additional context when needed. "
        "If you don't know something, admit it rather than making up information."
    )
}

@chat_router.route('/chat', methods=['POST'])
def chat():
    data = request.json
    model = data.get('model', 'gpt-4o')
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
        elif model == 'grok-1':
            response_text = ask_grok(conversations_cache[conversation_id])
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
            "role": "assistant",
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

@chat_router.route('/chats', methods=['GET'])
def get_chats():
    try:
        # Get all chats for anonymous user (you can add user authentication later)
        chats = mongo_db.get_all_chats()
        return jsonify({"chats": chats})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@chat_router.route('/chats/<chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    try:
        # Get conversation history
        limit = request.args.get('limit', 50, type=int)
        messages = mongo_db.get_chat_history(chat_id, limit)
        return jsonify({"messages": messages})
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@chat_router.route('/chats/<chat_id>', methods=['DELETE'])
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
