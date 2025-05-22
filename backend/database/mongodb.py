
import os
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection from environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "studymate_db")

# Collections
CHATS_COLLECTION = "chat_boxes"
MESSAGES_COLLECTION = "chat_messages"

class MongoDB:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.chats = self.db[CHATS_COLLECTION]
        self.messages = self.db[MESSAGES_COLLECTION]
    
    def create_chat(self, user_id="anonymous", title="New Chat", model="gpt-4o", system_prompt=None):
        """Create a new chat and return its ID"""
        chat_data = {
            "user_id": user_id,
            "title": title,
            "model": model,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Add system prompt if provided
        if system_prompt:
            chat_data["system_prompt"] = system_prompt
        
        result = self.chats.insert_one(chat_data)
        return str(result.inserted_id)
    
    def save_message(self, chat_id, role, content):
        """Save a message to the chat history"""
        try:
            chat_id_obj = ObjectId(chat_id)
            
            message_data = {
                "chat_id": chat_id_obj,
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow()
            }
            
            self.messages.insert_one(message_data)
            
            # Update chat's last updated timestamp
            self.chats.update_one(
                {"_id": chat_id_obj}, 
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            return True
        except Exception as e:
            print(f"Error saving message: {e}")
            return False
    
    def get_chat_history(self, chat_id, limit=50):
        """Get messages for a specific chat with a limit"""
        try:
            chat_id_obj = ObjectId(chat_id)
            messages = list(self.messages.find(
                {"chat_id": chat_id_obj}
            ).sort("timestamp", 1).limit(limit))
            
            # Convert ObjectId to string for serialization
            for msg in messages:
                if "_id" in msg:
                    msg["_id"] = str(msg["_id"])
                if "chat_id" in msg:
                    msg["chat_id"] = str(msg["chat_id"])
                    
            return messages
        except Exception as e:
            print(f"Error getting chat history: {e}")
            return []
    
    def get_chat_by_id(self, chat_id):
        """Get a chat by its ID"""
        try:
            chat_id_obj = ObjectId(chat_id)
            chat = self.chats.find_one({"_id": chat_id_obj})
            
            if chat:
                # Convert ObjectId to string for serialization
                if "_id" in chat:
                    chat["_id"] = str(chat["_id"])
                    
            return chat
        except Exception as e:
            print(f"Error getting chat by ID: {e}")
            return None
    
    def get_all_chats(self, user_id="anonymous", limit=20):
        """Get all chats for a specific user"""
        try:
            chats = list(self.chats.find(
                {"user_id": user_id}
            ).sort("updated_at", -1).limit(limit))
            
            # Convert ObjectId to string for serialization
            for chat in chats:
                if "_id" in chat:
                    chat["_id"] = str(chat["_id"])
                    
            return chats
        except Exception as e:
            print(f"Error getting all chats: {e}")
            return []
    
    def delete_chat(self, chat_id):
        """Delete a chat and all its messages"""
        try:
            chat_id_obj = ObjectId(chat_id)
            
            # Delete all messages in the chat
            self.messages.delete_many({"chat_id": chat_id_obj})
            
            # Delete the chat itself
            self.chats.delete_one({"_id": chat_id_obj})
            
            return True
        except Exception as e:
            print(f"Error deleting chat: {e}")
            return False
            
    def update_system_prompt(self, chat_id, system_prompt):
        """Update the system prompt for a chat"""
        try:
            chat_id_obj = ObjectId(chat_id)
            
            # Update system prompt in the chat document
            result = self.chats.update_one(
                {"_id": chat_id_obj},
                {"$set": {"system_prompt": system_prompt, "updated_at": datetime.utcnow()}}
            )
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating system prompt: {e}")
            return False
