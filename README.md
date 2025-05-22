
# AI Chat Application

This is a chat application using multiple AI models like Gemini, Claude, and OpenAI.

## Setup

### 1. Environment Variables

1. Backend environment:
   ```
   cp backend/.env.example backend/.env
   ```
   Edit the `backend/.env` file and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GROK_API_KEY=your_grok_api_key_here

   # MongoDB connection
   MONGO_URI=mongodb://localhost:27017/
   DB_NAME=studymate_db
   ```

2. Frontend environment:
   ```
   cp .env.example .env
   ```
   Set the API URL for your backend:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### 2. Database Setup

This application uses MongoDB with the database name `studymate_db`. Make sure MongoDB is installed and running:

```
mongod --dbpath /path/to/data/directory
```

### 3. Install Dependencies

#### Backend (FastAPI)
```
cd backend
pip install -r requirements.txt
```

#### Frontend
```
npm install
```

### 4. Run the Application

#### Backend
```
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

#### Frontend
```
npm run dev
```

## API Endpoints

The application provides the following API endpoints:

- `POST /api/chat`: Send a chat message and get a response
- `GET /api/chats`: Get all chats for the current user
- `GET /api/chats/{chat_id}`: Get chat history for a specific conversation
- `DELETE /api/chats/{chat_id}`: Delete a chat
- `PATCH /api/chats/{chat_id}/system-prompt`: Update system prompt for a chat
- `GET /api/health`: Check if the API server is running

## Supported AI Models

This application integrates with three AI providers:

1. **Google Gemini**: Used for text conversations
2. **Anthropic Claude**: Used for detailed, longer-form conversations
3. **OpenAI GPT**: Used for advanced language capabilities

## Troubleshooting

If you encounter issues:

1. Check that your API keys are correctly set in the `.env` file
2. Ensure the MongoDB server is running and accessible
3. Verify the backend server is running and accessible at the expected URL
4. Check browser console and backend logs for error messages
5. Make sure CORS is properly configured if you see CORS errors
