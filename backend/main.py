from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime
import json

# Import services
from services.openai_service import ask_openai
from services.gemini_service import ask_gemini
from services.claude_service import ask_claude
from services.grok_service import ask_grok

# Import MongoDB client
from database.mongodb import MongoDB

app = FastAPI(title="AI Chat API", version="1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", 
                   "http://localhost:8080", "http://127.0.0.1:8080",
                   "*"],  # Allow all origins temporarily for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB client
mongo_db = MongoDB()

# In-memory conversation cache
conversations_cache = {}

# Define request and response models
class MessageRequest(BaseModel):
    model: str
    message: str
    conversation_id: Optional[str] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    role: str
    content: str
    conversation_id: str

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI server is running"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: MessageRequest):
    model = request.model
    message = request.message
    conversation_id = request.conversation_id
    system_prompt = request.system_prompt
    
    try:
        # Create a new conversation if it doesn't exist
        if not conversation_id:
            print("Creating new conversation...")
            conversation_id = mongo_db.create_chat(model=model, title=message[:30], system_prompt=system_prompt)
            print(f"New conversation created with ID: {conversation_id} and system prompt")
            
            # Initialize with provided system message in cache
            conversations_cache[conversation_id] = [{
                "role": "system",
                "content": system_prompt or "You are a helpful AI assistant."
            }]
        elif conversation_id not in conversations_cache:
            print(f"Loading conversation history for ID: {conversation_id}")
            # Load conversation history from DB to cache
            messages_db = mongo_db.get_chat_history(conversation_id)
            
            # Get system prompt from the database
            chat_data = mongo_db.get_chat_by_id(conversation_id)
            system_prompt_content = chat_data.get('system_prompt') if chat_data else None
            
            if not system_prompt_content:
                system_prompt_content = "You are a helpful AI assistant."
                
            # Convert to the format needed by LLM clients
            conversations_cache[conversation_id] = [{
                "role": "system",
                "content": system_prompt_content
            }]
            
            # Add user and assistant messages
            for msg in messages_db:
                if msg["role"] != "system":  # Skip system messages
                    conversations_cache[conversation_id].append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
        
        # Handle system prompt updates for existing chats
        if system_prompt and conversation_id:
            # Update system prompt in database
            mongo_db.update_system_prompt(conversation_id, system_prompt)
            
            # Update in cache - find and update the system message
            system_msg_idx = next((i for i, msg in enumerate(conversations_cache[conversation_id]) 
                                if msg["role"] == "system"), None)
            if system_msg_idx is not None:
                conversations_cache[conversation_id][system_msg_idx]["content"] = system_prompt
        
        # Add user message to conversation cache
        conversations_cache[conversation_id].append({
            "role": "user",
            "content": message
        })
        
        # Save user message to MongoDB
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
        
        # Add assistant response to conversation cache
        conversations_cache[conversation_id].append({
            "role": "assistant",
            "content": response_text
        })
        
        # Save assistant response to MongoDB
        mongo_db.save_message(conversation_id, "assistant", response_text)
        
        return {
            "role": "assistant",
            "content": response_text,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Detailed error: {error_details}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats")
async def get_chats():
    try:
        chats = mongo_db.get_all_chats()
        return {"chats": chats}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats/{chat_id}")
async def get_chat_history(chat_id: str, limit: int = 50):
    try:
        messages = mongo_db.get_chat_history(chat_id, limit)
        return {"messages": messages}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: str):
    try:
        success = mongo_db.delete_chat(chat_id)
        
        if success:
            # Remove from cache if exists
            if chat_id in conversations_cache:
                del conversations_cache[chat_id]
            
            return {
                "success": True,
                "message": "Chat deleted successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete chat")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/chats/{chat_id}/system-prompt")
async def update_system_prompt(chat_id: str, request: dict):
    try:
        system_prompt = request.get('system_prompt', '')
        
        if not system_prompt:
            raise HTTPException(status_code=400, detail="System prompt cannot be empty")
        
        # Update system prompt in the database
        success = mongo_db.update_system_prompt(chat_id, system_prompt)
        
        if success:
            # Update system prompt in cache if it exists
            if chat_id in conversations_cache:
                # Find the system message index
                system_idx = next((i for i, msg in enumerate(conversations_cache[chat_id]) 
                                 if msg["role"] == "system"), None)
                
                if system_idx is not None:
                    # Update existing system message
                    conversations_cache[chat_id][system_idx]["content"] = system_prompt
                else:
                    # Add system message at the beginning
                    conversations_cache[chat_id].insert(0, {
                        "role": "system",
                        "content": system_prompt
                    })
            
            return {
                "success": True,
                "message": "System prompt updated successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update system prompt")
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
