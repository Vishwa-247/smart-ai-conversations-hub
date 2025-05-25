
# AI Chat Application

This is a comprehensive chat application using multiple AI models including Gemini 2.0 Flash and Phi 3 Mini, with advanced features like RAG (Retrieval-Augmented Generation), system prompts, and document processing.

## ✨ Features

### 🤖 Multiple AI Models
- **Gemini 2.0 Flash**: Google's latest high-performance model for fast, accurate responses
- **Phi 3 Mini**: Microsoft's efficient local model for privacy-focused conversations
- **Smart Model Selection**: Automatic model routing based on query complexity and context

### 📚 Document Intelligence (RAG)
- **Document Upload**: Support for PDF, DOCX, TXT, and MD files (up to 10MB)
- **Intelligent Processing**: Documents are automatically chunked and indexed for optimal retrieval
- **Context-Aware Responses**: AI responses are enhanced with relevant document context
- **Citation Display**: See which documents were used to generate responses
- **Vector Search**: Advanced semantic search using sentence transformers

### 🎯 System Prompts & Personalization
- **Custom Instructions**: Set system prompts to define AI behavior and personality
- **Persistent Memory**: System prompts are saved per conversation and remembered across sessions
- **First Message Workflow**: Intuitive setup where first message can be system instructions
- **Editable Prompts**: Modify system instructions anytime during conversations

### 💾 Data Persistence
- **Chat History**: All conversations automatically saved to MongoDB
- **Cross-Session Continuity**: Resume conversations exactly where you left off
- **Auto-Recovery**: Application automatically loads previous chats on startup
- **Real-time Sync**: Changes immediately synchronized with backend database

### ⚡ Performance Optimizations
- **Async Processing**: Non-blocking request handling for responsive UI
- **Timeout Management**: Smart timeout handling prevents hanging requests
- **Connection Pooling**: Optimized backend connections for faster responses
- **Loading States**: Clear feedback during processing and data loading

## 🚀 Setup

### 1. Environment Variables

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your API keys:
```env
# AI Model API Keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROK_API_KEY=your_grok_api_key_here

# Database Configuration
MONGO_URI=mongodb://localhost:27017/
DB_NAME=studymate_db

# Optional: Ollama Configuration (for local models)
OLLAMA_BASE_URL=http://localhost:11434
```

#### Frontend Configuration
```bash
cp .env.example .env
```

Set the API URL:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Database Setup

#### MongoDB Installation & Setup
```bash
# Install MongoDB (macOS with Homebrew)
brew install mongodb/brew/mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Or start manually:
mongod --dbpath /path/to/data/directory
```

The application uses database name `studymate_db` with collections:
- `chat_boxes`: Stores chat metadata and system prompts
- `chat_messages`: Stores individual messages
- `vector_storage`: RAG document embeddings (if using local vector storage)

### 3. Install Dependencies

#### Backend (FastAPI + Python)
```bash
cd backend
pip install -r requirements.txt
```

Key dependencies:
- `fastapi`: Modern web framework
- `pymongo`: MongoDB integration
- `sentence-transformers`: Document embeddings
- `python-multipart`: File upload handling
- `mammoth`: DOCX processing
- `PyPDF2`: PDF processing

#### Frontend (React + TypeScript)
```bash
npm install
```

Key dependencies:
- `react`: UI framework
- `axios`: HTTP client
- `@tanstack/react-query`: Data fetching
- `tailwindcss`: Styling
- `shadcn/ui`: Component library

### 4. Run the Application

#### Start Backend Server
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The FastAPI server will start at `http://localhost:8000` with:
- API endpoints at `/api/*`
- Interactive docs at `/docs`
- Health check at `/api/health`

#### Start Frontend Development Server
```bash
npm run dev
```

The React app will start at `http://localhost:5173`

## 📋 API Documentation

### Core Chat Endpoints
- `POST /api/chat`: Send message and get AI response
- `GET /api/chats`: List all user conversations
- `GET /api/chats/{chat_id}`: Get specific chat history
- `DELETE /api/chats/{chat_id}`: Delete conversation
- `PATCH /api/chats/{chat_id}/system-prompt`: Update system instructions

### Document & RAG Endpoints
- `POST /api/upload-document`: Upload and process documents for RAG
- `GET /api/performance-stats`: Get model performance metrics

### System Endpoints
- `GET /api/health`: Check API server status and connected services

## 🔧 How RAG (Document Intelligence) Works

### 1. Document Processing Pipeline
```
Upload File → Extract Text → Chunk Content → Generate Embeddings → Store in Vector DB
```

### 2. Query Enhancement Process
```
User Query → Semantic Search → Retrieve Relevant Chunks → Augment Prompt → Generate Response
```

### 3. Supported Document Types
- **PDF**: Extracted using PyPDF2 with page-by-page processing
- **DOCX**: Processed using mammoth for clean text extraction
- **TXT/MD**: Direct text processing with encoding detection

### 4. Document Status Indicators
- ✅ **Successfully Processed**: Document indexed and ready for queries
- 📄 **Processing**: Document being chunked and embedded
- ❌ **Failed**: Error during processing (check file format/size)

### 5. Citation System
When AI responses use document context:
- Source document name displayed
- Relevant chunks highlighted
- Similarity scores shown
- Multiple sources consolidated

## 🎯 System Prompts Guide

### What are System Prompts?
System prompts are instructions that define how the AI should behave throughout a conversation. They set the personality, expertise level, response style, and focus areas.

### Best Practices
```markdown
# Good System Prompt Examples:

## Coding Assistant
"You are an expert software engineer specializing in React and TypeScript. Provide clear, well-commented code examples and explain complex concepts step-by-step."

## Creative Writer
"You are a creative writing assistant. Help users craft engaging stories with vivid descriptions, interesting characters, and compelling dialogue."

## Business Analyst
"You are a business analyst with expertise in market research and data analysis. Provide actionable insights backed by logical reasoning."
```

### System Prompt Workflow
1. **New Chat**: First message can optionally be system instructions
2. **Visual Indicator**: Blue highlight shows when setting system prompt
3. **Skip Option**: Can skip system prompt and start chatting immediately
4. **Edit Later**: System prompts can be modified anytime via chat settings
5. **Persistence**: Instructions saved and applied to all future messages

## 🔍 Troubleshooting

### Common Issues & Solutions

#### API Connection Errors
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Verify environment variables
cat backend/.env | grep API_KEY
```

#### Model Response Issues
- **Gemini Timeout**: Check GEMINI_API_KEY validity and network connection
- **Phi Model Slow**: Ensure sufficient system resources (4GB+ RAM recommended)
- **Generic Errors**: Check backend logs for detailed error messages

#### Database Connection Problems
```bash
# Check MongoDB status
brew services list | grep mongodb

# Test connection
mongosh mongodb://localhost:27017/studymate_db
```

#### RAG/Document Issues
- **Upload Failures**: Verify file size (<10MB) and supported formats
- **No Context**: Check if documents were successfully processed in backend logs
- **Poor Retrieval**: Try rephrasing queries or uploading more relevant documents

#### Chat History Not Loading
- Verify MongoDB connection and database permissions
- Check browser console for API errors
- Ensure backend and frontend are using same API URL

### Performance Optimization Tips

1. **Model Selection**:
   - Use Gemini for complex queries requiring reasoning
   - Use Phi for simple, fast responses
   - Consider local models for privacy-sensitive content

2. **Document Management**:
   - Keep document chunks focused and relevant
   - Regularly clean up unused documents
   - Upload documents in common formats (PDF, DOCX)

3. **System Resources**:
   - Monitor memory usage with multiple large documents
   - Consider SSD storage for better vector search performance
   - Ensure stable internet for cloud model APIs

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Submit pull request with detailed description

### Code Style
- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits for git messages
- Component-based architecture

### Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd backend && python -m pytest

# Integration tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 📖 Docs: [Full documentation](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/user/repo/issues)
