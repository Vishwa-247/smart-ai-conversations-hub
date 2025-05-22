
# AI Chat Application

This is a chat application using multiple AI models like Gemini, Claude, and Grok.

## Setup

### 1. Environment Variables

#### Backend

1. Copy the `.env.example` file to `.env` in the backend directory:
   ```
   cp backend/.env.example backend/.env
   ```
2. Edit the `backend/.env` file and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GROK_API_KEY=your_grok_api_key_here
   ```

#### Frontend

1. Copy the `.env.example` file to `.env` in the root directory:
   ```
   cp .env.example .env
   ```
2. Edit the `.env` file if needed to customize the API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### 2. Install Dependencies

#### Backend (FastAPI)
```
cd backend
pip install -r requirements-fastapi.txt
```

#### Frontend
```
npm install
```

### 3. Run the Application

#### Backend (FastAPI)
```
cd backend
uvicorn fast_api_app:app --reload --port 5000
```

#### Frontend
```
npm run dev
```

## Features

- Chat with multiple AI models (Gemini, Claude, Grok)
- Customize system prompts for each conversation (required before starting a chat)
- Edit system prompts during conversation
- Upload images, audio, and other files
- Save and manage multiple conversations

## API Implementations

This application integrates with three AI providers:

1. **Google Gemini**: Used for text and multimodal conversations
2. **Anthropic Claude**: Used for detailed, longer-form conversations
3. **Grok**: Used for more creative, exploratory conversations

Each API has its own implementation in the `backend/services` directory. To add more providers:

1. Create a new service file (e.g., `new_provider_service.py`)
2. Implement the required interface
3. Add the service to `fast_api_app.py`

## Troubleshooting

If you encounter issues:

1. Check that your API keys are correctly set in the `.env` file
2. Ensure the backend server is running and accessible at the expected URL
3. Check browser console and backend logs for error messages
4. For system prompt issues, ensure you're providing a system prompt before starting a chat (now required)
