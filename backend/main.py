
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import time
from datetime import datetime
import json

# Import all services
from services.openai_service import ask_openai
from services.gemini_service import ask_gemini
from services.claude_service import ask_claude
from services.grok_service import ask_grok
from services.ollama_service import ask_ollama
from services.document_processor import DocumentProcessor
from services.rag_service import RAGService
from services.model_router import ModelRouter

# Import MongoDB client
from database.mongodb import MongoDB

app = FastAPI(title="Hybrid AI Agent API", version="2.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", 
                   "http://localhost:8080", "http://127.0.0.1:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
mongo_db = MongoDB()
document_processor = DocumentProcessor()
rag_service = RAGService()
model_router = ModelRouter()
conversations_cache = {}

# Define request and response models
class MessageRequest(BaseModel):
    model: str
    message: str
    conversation_id: Optional[str] = None
    system_prompt: Optional[str] = None
    use_rag: Optional[bool] = True

class ChatResponse(BaseModel):
    role: str
    content: str
    conversation_id: str
    model_used: Optional[str] = None
    citations: Optional[List[dict]] = None
    reasoning: Optional[str] = None

class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    filename: str
    chunk_count: Optional[int] = None

@app.get("/api/health")
async def health_check():
    print("🔍 Health check requested...")
    ollama_status = model_router.ollama_service.is_available()
    print(f"📊 Ollama status: {ollama_status}")
    
    return {
        "status": "ok", 
        "message": "Hybrid AI Agent API is running",
        "services": {
            "ollama": ollama_status,
            "rag": True,
            "document_processor": True,
            "mongodb": True
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/upload-document", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        print(f"📁 Document upload started: {file.filename}")
        
        # Read file content
        file_content = await file.read()
        
        # Process the document
        processed_doc = document_processor.process_document(file_content, file.filename)
        
        # Add to RAG system
        rag_service.add_document(
            processed_doc["text"],
            processed_doc["chunks"],
            {"filename": file.filename, "upload_time": datetime.utcnow().isoformat()}
        )
        
        print(f"✅ Document processed successfully: {file.filename} ({processed_doc['chunk_count']} chunks)")
        
        return DocumentUploadResponse(
            success=True,
            message=f"Document {file.filename} processed successfully",
            filename=file.filename,
            chunk_count=processed_doc["chunk_count"]
        )
        
    except Exception as e:
        print(f"❌ Document upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: MessageRequest):
    message = request.message
    conversation_id = request.conversation_id
    system_prompt = request.system_prompt
    use_rag = request.use_rag
    model = request.model
    
    print(f"🚀 Chat request received:")
    print(f"   Model: {model}")
    print(f"   Message: {message[:100]}...")
    print(f"   Conversation ID: {conversation_id}")
    print(f"   System Prompt: {'Yes' if system_prompt else 'No'}")
    print(f"   Use RAG: {use_rag}")
    
    try:
        start_time = time.time()
        
        # Retrieve relevant context if RAG is enabled
        retrieved_chunks = []
        citations = []
        
        if use_rag:
            print("📚 Retrieving RAG context...")
            retrieved_chunks = rag_service.retrieve_relevant_chunks(message)
            citations = rag_service.get_citations(retrieved_chunks)
            print(f"   Found {len(retrieved_chunks)} relevant chunks")
        
        # Create conversation if it doesn't exist
        if not conversation_id:
            print("🆕 Creating new conversation...")
            conversation_id = mongo_db.create_chat(
                model=model, 
                title=message[:30], 
                system_prompt=system_prompt
            )
            print(f"   Created conversation: {conversation_id}")
            
            conversations_cache[conversation_id] = [{
                "role": "system",
                "content": system_prompt or "You are a helpful AI assistant with access to uploaded documents."
            }]
        elif conversation_id not in conversations_cache:
            print(f"📚 Loading conversation history: {conversation_id}")
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
            print(f"   Loaded {len(messages_db)} messages from history")
        
        # Enhance message with RAG context if available
        enhanced_message = message
        if retrieved_chunks:
            print("🔗 Enhancing message with RAG context...")
            enhanced_message = rag_service.generate_rag_prompt(message, retrieved_chunks)
        
        # Add user message to conversation
        conversations_cache[conversation_id].append({
            "role": "user",
            "content": enhanced_message
        })
        
        # Save user message to database
        print("💾 Saving user message to database...")
        mongo_db.save_message(conversation_id, "user", message)
        
        # Generate response using selected model
        print(f"🤖 Generating response using {model}...")
        response_text = ""
        model_used = model
        
        try:
            if model == "phi3:mini":
                print("🟠 Calling Ollama service...")
                response_text = ask_ollama(conversations_cache[conversation_id], model)
                model_used = "ollama (phi3:mini)"
            elif model == "gemini-2.0-flash":
                print("🟢 Calling Gemini service...")
                response_text = ask_gemini(conversations_cache[conversation_id])
                model_used = "gemini-2.0-flash"
            elif model == "grok-2":
                print("🟡 Calling Grok service...")
                response_text = ask_grok(conversations_cache[conversation_id])
                model_used = "grok-2"
            else:
                print(f"⚠️ Unknown model {model}, defaulting to Gemini...")
                response_text = ask_gemini(conversations_cache[conversation_id])
                model_used = "gemini-2.0-flash (fallback)"
                
            print(f"✅ Response generated successfully ({len(response_text)} characters)")
            
        except Exception as model_error:
            print(f"❌ Error with {model}: {str(model_error)}")
            # Fallback to Gemini
            try:
                print("🔄 Attempting fallback to Gemini...")
                response_text = ask_gemini(conversations_cache[conversation_id])
                model_used = "gemini-2.0-flash (fallback)"
                print("✅ Fallback successful")
            except Exception as fallback_error:
                print(f"❌ Fallback failed: {str(fallback_error)}")
                raise HTTPException(status_code=500, detail=f"All models failed: {str(fallback_error)}")
        
        end_time = time.time()
        response_time = end_time - start_time
        print(f"⏱️ Total response time: {response_time:.2f} seconds")
        
        # Add assistant response to conversation
        conversations_cache[conversation_id].append({
            "role": "assistant",
            "content": response_text
        })
        
        # Save assistant response to database
        print("💾 Saving assistant response to database...")
        mongo_db.save_message(conversation_id, "assistant", response_text)
        
        print(f"🎉 Chat request completed successfully")
        
        return {
            "role": "assistant",
            "content": response_text,
            "conversation_id": conversation_id,
            "model_used": model_used,
            "citations": citations if citations else None,
            "reasoning": f"Processed in {response_time:.2f}s using {model_used}"
        }
        
    except Exception as e:
        print(f"💥 Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats")
async def get_chats():
    try:
        print("📚 Fetching all chats...")
        chats = mongo_db.get_all_chats()
        print(f"✅ Retrieved {len(chats)} chats")
        return {"chats": chats}
    except Exception as e:
        print(f"❌ Error fetching chats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats/{chat_id}")
async def get_chat_history(chat_id: str, limit: int = 50):
    try:
        print(f"📖 Fetching chat history for {chat_id}...")
        messages = mongo_db.get_chat_history(chat_id, limit)
        print(f"✅ Retrieved {len(messages)} messages")
        return {"messages": messages}
    except Exception as e:
        print(f"❌ Error fetching chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: str):
    try:
        print(f"🗑️ Deleting chat {chat_id}...")
        success = mongo_db.delete_chat(chat_id)
        if success and chat_id in conversations_cache:
            del conversations_cache[chat_id]
        print(f"✅ Chat deletion {'successful' if success else 'failed'}")
        return {"success": success, "message": "Chat deleted successfully" if success else "Failed to delete chat"}
    except Exception as e:
        print(f"❌ Error deleting chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/chats/{chat_id}/system-prompt")
async def update_system_prompt(chat_id: str, request: dict):
    try:
        system_prompt = request.get('system_prompt', '')
        print(f"⚙️ Updating system prompt for {chat_id}: {system_prompt[:50]}...")
        success = mongo_db.update_system_prompt(chat_id, system_prompt)
        
        if success and chat_id in conversations_cache:
            system_idx = next((i for i, msg in enumerate(conversations_cache[chat_id]) 
                             if msg["role"] == "system"), None)
            if system_idx is not None:
                conversations_cache[chat_id][system_idx]["content"] = system_prompt
            else:
                conversations_cache[chat_id].insert(0, {"role": "system", "content": system_prompt})
        
        print(f"✅ System prompt update {'successful' if success else 'failed'}")
        return {"success": success, "message": "System prompt updated successfully" if success else "Failed to update system prompt"}
    except Exception as e:
        print(f"❌ Error updating system prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/performance-stats")
async def get_performance_stats():
    try:
        print("📊 Fetching performance stats...")
        stats = model_router.get_performance_stats()
        system_resources = model_router.get_system_resources()
        
        return {
            "performance": stats,
            "system_resources": system_resources,
            "ollama_available": model_router.ollama_service.is_available(),
            "installed_models": model_router.ollama_service.get_installed_models()
        }
    except Exception as e:
        print(f"❌ Error fetching performance stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
