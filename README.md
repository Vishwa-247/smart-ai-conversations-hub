
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

   **IMPORTANT**: For the application to work properly, you must provide valid API keys for the models you want to use.

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

## Troubleshooting

If you encounter issues:

1. **API Keys**: Make sure you've set up all required API keys in the `.env` file.
   - For Gemini errors: Check that GEMINI_API_KEY is properly set in the backend/.env file
   - For OpenAI errors: Check your OPENAI_API_KEY
   - For Claude errors: Check your ANTHROPIC_API_KEY
   - For Grok errors: Check your GROK_API_KEY

2. **MongoDB errors**: 
   - Ensure MongoDB is running at the correct URL (default: mongodb://localhost:27017/)
   - Check that the database name is correctly set (default: studymate_db)

3. **Connection issues**: 
   - Verify the backend server is running at the expected URL
   - Check CORS settings if you see CORS errors
   - Make sure frontend is configured with the correct API URL

4. **Console logs**: Check both browser console and backend terminal for error messages

## API Endpoints

The application provides the following API endpoints:

- `POST /api/chat`: Send a chat message and get a response
- `GET /api/chats`: Get all chats for the current user
- `GET /api/chats/{chat_id}`: Get chat history for a specific conversation
- `DELETE /api/chats/{chat_id}`: Delete a chat
- `PATCH /api/chats/{chat_id}/system-prompt`: Update system prompt for a chat
- `GET /api/health`: Check if the API server is running
