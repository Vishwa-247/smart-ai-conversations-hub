
from datetime import datetime
from typing import List, Optional, Dict, Any

class Message:
    def __init__(self, chat_id: str, role: str, content: str, timestamp: Optional[datetime] = None):
        self.chat_id = chat_id
        self.role = role
        self.content = content
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "chat_id": self.chat_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp
        }

class Chat:
    def __init__(self, user_id: str = "anonymous", title: str = "New Chat", model: str = "gpt-4o", 
                 created_at: Optional[datetime] = None, updated_at: Optional[datetime] = None, id: Optional[str] = None):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.model = model
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        data = {
            "user_id": self.user_id,
            "title": self.title,
            "model": self.model,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self.id:
            data["_id"] = self.id
        return data
