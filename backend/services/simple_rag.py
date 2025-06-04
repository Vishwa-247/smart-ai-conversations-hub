
import os
import hashlib
from typing import List, Dict, Any, Optional
from pathlib import Path
import logging
import PyPDF2
import docx
import mammoth
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class SimpleRAG:
    def __init__(self):
        self.documents_dir = Path("documents")
        self.documents_dir.mkdir(exist_ok=True)
        self.documents_metadata = []
        # Store documents per chat
        self.chat_documents = {}  # chat_id -> {file_id: document_data}
        
        # Web search trigger keywords
        self.search_triggers = [
            # Time-sensitive keywords
            'latest', 'recent', 'current', 'today', 'now', 'this week', 'this month',
            'yesterday', 'breaking', 'update', 'news', 'new', 'fresh',
            
            # Real-time data keywords
            'weather', 'stock price', 'exchange rate', 'cryptocurrency', 'bitcoin',
            'market', 'price', 'cost', 'temperature', 'forecast',
            
            # Current events keywords
            'happening', 'events', 'trending', 'viral', 'popular',
            
            # Comparative keywords that might need current data
            'vs', 'versus', 'compare', 'comparison', 'better', 'best',
            
            # Question words that often need real-time answers
            'what is the', 'how much', 'when did', 'who is', 'where is'
        ]
        
        # Keywords that should NOT trigger search (document-focused)
        self.no_search_keywords = [
            'document', 'file', 'upload', 'analyze this', 'summarize this',
            'from the document', 'in the pdf', 'according to the file'
        ]
    
    # ... keep existing code (save_file, extract_text methods remain the same)
    def save_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file and return file path"""
        file_hash = hashlib.md5(file_content).hexdigest()[:10]
        extension = Path(filename).suffix
        safe_filename = f"{file_hash}_{filename}"
        
        file_path = self.documents_dir / safe_filename
        
        with open(file_path, 'wb') as f:
            f.write(file_content)
            
        return str(file_path)
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
            return ""
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            with open(file_path, "rb") as docx_file:
                result = mammoth.extract_raw_text(docx_file)
                return result.value
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {e}")
            return ""
    
    def extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error extracting text from TXT {file_path}: {e}")
            return ""
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from various file formats"""
        extension = Path(file_path).suffix.lower()
        
        if extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif extension == '.docx':
            return self.extract_text_from_docx(file_path)
        elif extension in ['.txt', '.md']:
            return self.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {extension}")
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks with overlap"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            if end < len(text):
                for i in range(end, max(start + chunk_size//2, end - 100), -1):
                    if text[i] in '.!?\n':
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks
    
    def process_document(self, file_content: bytes, filename: str, chat_id: str = None) -> Dict[str, Any]:
        """Process a document and store it for a specific chat"""
        try:
            file_path = self.save_file(file_content, filename)
            text = self.extract_text(file_path)
            
            if not text:
                raise ValueError("No text could be extracted from the document")
            
            chunks = self.chunk_text(text)
            file_id = hashlib.md5(file_content).hexdigest()[:10]
            
            # Store document for specific chat
            if chat_id:
                if chat_id not in self.chat_documents:
                    self.chat_documents[chat_id] = {}
                
                self.chat_documents[chat_id][file_id] = {
                    "filename": filename,
                    "chunks": chunks,
                    "full_text": text,
                    "upload_time": str(datetime.now()),
                    "file_path": file_path
                }
            
            # Update global metadata
            self.documents_metadata.append({
                "id": file_id,
                "filename": filename,
                "file_path": file_path,
                "chunks": len(chunks),
                "upload_time": str(datetime.now()),
                "chat_id": chat_id
            })
            
            logger.info(f"Processed document {filename} with {len(chunks)} chunks for chat {chat_id}")
            
            return {
                "filename": filename,
                "chunk_count": len(chunks),
                "file_path": file_path,
                "file_id": file_id
            }
            
        except Exception as e:
            logger.error(f"Error processing document {filename}: {e}")
            raise Exception(f"Document processing failed: {str(e)}")
    
    def should_trigger_web_search(self, query: str) -> bool:
        """Determine if a query should trigger web search"""
        query_lower = query.lower()
        
        # Don't search if it's clearly about documents
        for keyword in self.no_search_keywords:
            if keyword in query_lower:
                return False
        
        # Check for search trigger keywords
        for trigger in self.search_triggers:
            if trigger in query_lower:
                logger.info(f"🔍 Web search triggered by keyword: '{trigger}'")
                return True
        
        # Check for question patterns that often need real-time data
        question_patterns = [
            r'what.*is.*price',
            r'how.*much.*cost',
            r'when.*did.*happen',
            r'who.*is.*currently',
            r'where.*is.*now',
            r'what.*happened.*today',
            r'latest.*on',
        ]
        
        for pattern in question_patterns:
            if re.search(pattern, query_lower):
                logger.info(f"🔍 Web search triggered by pattern: '{pattern}'")
                return True
        
        return False
    
    def simple_search(self, query: str, chat_id: str = None, top_k: int = 3) -> str:
        """Simple keyword-based search through documents for a specific chat"""
        if not chat_id or chat_id not in self.chat_documents or not self.chat_documents[chat_id]:
            return query
        
        try:
            query_words = query.lower().split()
            relevant_chunks = []
            
            for file_id, doc_data in self.chat_documents[chat_id].items():
                for chunk in doc_data["chunks"]:
                    chunk_lower = chunk.lower()
                    score = sum(1 for word in query_words if word in chunk_lower)
                    
                    if score > 0:
                        relevant_chunks.append({
                            "chunk": chunk,
                            "score": score,
                            "filename": doc_data["filename"]
                        })
            
            # Sort by relevance score
            relevant_chunks.sort(key=lambda x: x["score"], reverse=True)
            top_chunks = relevant_chunks[:top_k]
            
            if not top_chunks:
                return query
            
            # Build context
            context_parts = []
            for i, chunk_data in enumerate(top_chunks, 1):
                source = chunk_data["filename"]
                context_parts.append(f"[Document Reference {i}: {source}]\n{chunk_data['chunk']}")
            
            context = "\n\n".join(context_parts)
            
            enhanced_prompt = f"""You have access to relevant information from uploaded documents. Use this knowledge naturally in your response.

Available Context:
{context}

User Query: {query}

Please provide a comprehensive and helpful response:"""
            
            return enhanced_prompt
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return query
    
    def enhance_with_web_search(self, query: str, web_search_results: str) -> str:
        """Enhance query with web search results"""
        if not web_search_results:
            return query
        
        enhanced_prompt = f"""You have access to current web search results. Use this information to provide an up-to-date and comprehensive response.

Current Web Information:
{web_search_results}

User Query: {query}

Please provide a comprehensive response using the latest information available:"""
        
        return enhanced_prompt
    
    def combine_sources(self, query: str, document_context: str, web_search_results: str, chat_id: str = None) -> str:
        """Combine document context with web search results"""
        sources = []
        
        # Add document context if available
        if chat_id and self.has_documents(chat_id):
            doc_context = self.simple_search(query, chat_id)
            if doc_context != query:  # If document context was found
                sources.append("Document Knowledge Base")
        
        # Add web search results if available
        if web_search_results:
            sources.append("Current Web Information")
        
        if not sources:
            return query
        
        # Build combined prompt
        combined_prompt = f"""You have access to multiple information sources. Use all available information to provide a comprehensive response.

"""
        
        if document_context and document_context != query:
            combined_prompt += f"Document Context:\n{document_context}\n\n"
        
        if web_search_results:
            combined_prompt += f"Current Web Information:\n{web_search_results}\n\n"
        
        combined_prompt += f"""User Query: {query}

Please provide a comprehensive response using all available sources:"""
        
        return combined_prompt
    
    # ... keep existing code (is_url_analysis_request, has_documents, get_document_list, delete_document methods remain the same)
    def is_url_analysis_request(self, message: str) -> bool:
        """Check if the message is asking to analyze URL content"""
        url_indicators = [
            "analyze and summarize the following content from:",
            "please analyze",
            "content summary:",
            "url:",
            "title:",
            "please provide a comprehensive summary"
        ]
        
        message_lower = message.lower()
        return any(indicator in message_lower for indicator in url_indicators)
    
    def has_documents(self, chat_id: str = None) -> bool:
        """Check if any documents are loaded for a specific chat"""
        if not chat_id:
            return len(self.documents_metadata) > 0
        return chat_id in self.chat_documents and len(self.chat_documents[chat_id]) > 0
    
    def get_document_list(self, chat_id: str = None) -> List[Dict]:
        """Get list of uploaded documents for a specific chat"""
        if not chat_id:
            return self.documents_metadata
        
        if chat_id not in self.chat_documents:
            return []
        
        return [
            {
                "id": file_id,
                "filename": doc_data["filename"],
                "file_path": doc_data.get("file_path", ""),
                "chunks": len(doc_data["chunks"]),
                "upload_time": doc_data["upload_time"]
            }
            for file_id, doc_data in self.chat_documents[chat_id].items()
        ]
    
    def delete_document(self, filename: str, chat_id: str = None) -> bool:
        """Delete a document from a specific chat"""
        try:
            if chat_id and chat_id in self.chat_documents:
                # Find and remove from chat documents
                file_id_to_remove = None
                for file_id, doc_data in self.chat_documents[chat_id].items():
                    if doc_data["filename"] == filename:
                        file_id_to_remove = file_id
                        break
                
                if file_id_to_remove:
                    del self.chat_documents[chat_id][file_id_to_remove]
                    
                    # Remove from global metadata
                    self.documents_metadata = [
                        doc for doc in self.documents_metadata 
                        if not (doc["filename"] == filename and doc.get("chat_id") == chat_id)
                    ]
                    
                    logger.info(f"Deleted document {filename} from chat {chat_id}")
                    return True
            
            return False
        except Exception as e:
            logger.error(f"Error deleting document {filename}: {e}")
            return False
