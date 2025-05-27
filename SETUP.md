
# AI Chat Application Setup Guide

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **MongoDB** running locally or MongoDB Atlas connection
4. **Git** installed

## Backend Setup

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   MONGO_URI=mongodb://localhost:27017/
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   OLLAMA_BASE_URL=http://localhost:11434
   ```

6. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ..  # if you're in backend directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database Setup

1. **Install MongoDB locally** or use MongoDB Atlas
2. **Create database named:** `Ai_Chat_db`
3. **The application will automatically create required collections**

## Optional: Ollama Setup (for local Phi3 model)

1. **Install Ollama:** https://ollama.ai/
2. **Pull the Phi3 model:**
   ```bash
   ollama pull phi3:mini
   ```
3. **Start Ollama service:**
   ```bash
   ollama serve
   ```

## API Keys Required

- **Gemini API Key:** Get from Google AI Studio
- **GROQ API Key:** Get from GROQ Console (free tier available)

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Features

- ✅ Multi-model chat (Gemini, GROQ, Phi3)
- ✅ Document upload and RAG processing
- ✅ Chat history persistence
- ✅ System prompt customization
- ✅ File attachment support
- ✅ Drag and drop functionality

## Troubleshooting

1. **Backend not starting:** Check if MongoDB is running
2. **Frontend can't connect:** Verify backend is running on port 8000
3. **API errors:** Check your API keys in .env file
4. **Document upload fails:** Ensure documents directory has write permissions
