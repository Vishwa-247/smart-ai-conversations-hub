
# AI Chat Application

A modern AI chat application with document analysis capabilities using LangChain, FastAPI, and React.

## Features

- **Multi-Model Support**: Gemini, GROQ, and local Phi3 models
- **Document Analysis**: Upload and analyze PDFs using LangChain RAG
- **Chat History**: Persistent chat storage with MongoDB
- **System Prompts**: Customizable system prompts for each model
- **Drag & Drop**: Easy document upload with preview

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)
- API Keys: Gemini, GROQ

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

5. **Start FastAPI server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

### Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Create database**: `AI_Chat_db`
3. **Collections will be created automatically**

## API Endpoints

- `POST /api/chat` - Send chat message
- `GET /api/chats` - Get all chats
- `GET /api/chats/{chat_id}` - Get chat history
- `POST /api/upload-document` - Upload document for analysis
- `PATCH /api/chats/{chat_id}/system-prompt` - Update system prompt

## Usage

1. **Start a new chat** - Select model and optionally set system prompt
2. **Upload documents** - Drag & drop PDFs for analysis
3. **Chat with AI** - Ask questions about uploaded documents
4. **System Settings** - Click settings icon to modify system prompts

## Models Available

- **Gemini 2.0 Flash**: Google's latest model
- **GROQ Llama**: Fast inference with GROQ API
- **Phi3 Mini**: Local model (if Ollama is running)

## File Structure

```
backend/
├── main.py                 # FastAPI application
├── services/
│   ├── gemini_service.py   # Gemini API integration
│   ├── groq_service.py     # GROQ API integration
│   ├── ollama_service.py   # Local Ollama integration
│   └── langchain_rag.py    # Document processing with LangChain
├── database/
│   └── mongodb.py          # MongoDB operations
└── requirements.txt        # Python dependencies

src/
├── components/             # React components
├── hooks/                  # Custom hooks
├── contexts/               # React contexts
├── services/               # API services
└── types/                  # TypeScript types
```

## Environment Variables Required

**Backend (.env)**:
- `MONGO_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `GROQ_API_KEY` - GROQ API key

## Troubleshooting

1. **MongoDB Connection**: Ensure MongoDB is running on port 27017
2. **API Keys**: Verify all API keys are correctly set in .env
3. **Port Conflicts**: Backend runs on 8000, frontend on 5173
4. **Document Upload**: Ensure proper file permissions in backend/documents/

## API Key Setup

1. **Gemini**: Get API key from Google AI Studio
2. **GROQ**: Get API key from console.groq.com
3. **MongoDB**: Use local installation or MongoDB Atlas

The application will automatically fallback to available models if one fails.
