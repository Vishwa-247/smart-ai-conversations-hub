
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import time
from datetime import datetime
import json

# Import services
from services.gemini_service import ask_gemini
from services.groq_service import ask_groq
from services.ollama_service import ask_ollama
from services.simple_rag import SimpleRAG

# Import MongoDB client
from database.mongodb import MongoDB

app = FastAPI(title="AI Chat Application", version="1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
mongo_db = MongoDB()
simple_rag = SimpleRAG()
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
    model_used: Optional[str] = None

class CreateChatRequest(BaseModel):
    id: str
    title: str
    model: str
    system_prompt: Optional[str] = None

class SaveMessageRequest(BaseModel):
    role: str
    content: str

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "AI Chat API is running"}

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        
        # Process document with Simple RAG
        result = simple_rag.process_document(file_content, file.filename)
        
        return {
            "success": True,
            "message": f"Document {file.filename} processed successfully",
            "filename": file.filename,
            "chunk_count": result["chunk_count"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: MessageRequest):
    message = request.message
    conversation_id = request.conversation_id
    system_prompt = request.system_prompt
    model = request.model
    
    try:
        # Create conversation if it doesn't exist
        if not conversation_id:
            conversation_id = mongo_db.create_chat(
                model=model, 
                title=message[:30], 
                system_prompt=system_prompt
            )
            
            conversations_cache[conversation_id] = [{
                "role": "system",
                "content": system_prompt or "You are a helpful AI assistant."
            }]
        elif conversation_id not in conversations_cache:
            # Load conversation history
            messages_db = mongo_db.get_chat_history(conversation_id)
            chat_data = mongo_db.get_chat_by_id(conversation_id)
            system_prompt_content = chat_data.get('system_prompt') if chat_data else "You are a helpful AI assistant."
            
            conversations_cache[conversation_id] = [{
                "role": "system",
                "content": system_prompt_content
            }]
            
            for msg in messages_db:
                if msg["role"] != "system":
                    conversations_cache[conversation_id].append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
        
        # Check if we have relevant documents
        enhanced_message = message
        if simple_rag.has_documents():
            enhanced_message = simple_rag.simple_search(message)
        
        # Add user message to conversation
        conversations_cache[conversation_id].append({
            "role": "user",
            "content": enhanced_message
        })
        
        # Save user message to database
        mongo_db.save_message(conversation_id, "user", message)
        
        # Generate response based on model
        if model == 'gemini-2.0-flash':
            response_text = ask_gemini(conversations_cache[conversation_id])
        elif model == 'groq-llama':
            response_text = ask_groq(conversations_cache[conversation_id])
        elif model == 'phi3:mini':
            response_text = ask_ollama(conversations_cache[conversation_id], model)
        else:
            response_text = ask_gemini(conversations_cache[conversation_id])  # Default fallback
        
        # Add assistant response to conversation
        conversations_cache[conversation_id].append({
            "role": "assistant",
            "content": response_text
        })
        
        # Save assistant response to database
        mongo_db.save_message(conversation_id, "assistant", response_text)
        
        return {
            "role": "assistant",
            "content": response_text,
            "conversation_id": conversation_id,
            "model_used": model
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats")
async def get_chats():
    try:
        chats = mongo_db.get_all_chats()
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chats")
async def create_chat(request: CreateChatRequest):
    try:
        success = mongo_db.create_chat(
            chat_id=request.id,
            model=request.model,
            title=request.title,
            system_prompt=request.system_prompt
        )
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats/{chat_id}")
async def get_chat_history(chat_id: str, limit: int = 50):
    try:
        messages = mongo_db.get_chat_history(chat_id, limit)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chats/{chat_id}/messages")
async def save_message(chat_id: str, request: SaveMessageRequest):
    try:
        success = mongo_db.save_message(chat_id, request.role, request.content)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: str):
    try:
        success = mongo_db.delete_chat(chat_id)
        if success and chat_id in conversations_cache:
            del conversations_cache[chat_id]
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/chats/{chat_id}/system-prompt")
async def update_system_prompt(chat_id: str, request: dict):
    try:
        system_prompt = request.get('system_prompt', '')
        success = mongo_db.update_system_prompt(chat_id, system_prompt)
        
        if success and chat_id in conversations_cache:
            system_idx = next((i for i, msg in enumerate(conversations_cache[chat_id]) 
                             if msg["role"] == "system"), None)
            if system_idx is not None:
                conversations_cache[chat_id][system_idx]["content"] = system_prompt
            else:
                conversations_cache[chat_id].insert(0, {"role": "system", "content": system_prompt})
        
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def get_uploaded_documents():
    try:
        documents = simple_rag.get_document_list()
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
