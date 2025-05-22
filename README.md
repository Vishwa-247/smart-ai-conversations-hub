
# AI Chat Application

This is a chat application using multiple AI models like Gemini, Claude, and OpenAI.

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

   # MongoDB connection
   MONGO_URI=mongodb://localhost:27017/
   DB_NAME=studymate_db
   ```

#### Frontend

1. Copy the `.env.example` file to `.env` in the root directory:
   ```
   cp .env.example .env
   ```
2. Edit the `.env` file to set the correct API URL for your backend:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   Note: If your frontend is running on port 8080, make sure the backend CORS settings allow it.

### 2. Database Setup

This application uses MongoDB with the database name `studymate_db`. Make sure MongoDB is installed and running:

```
mongod --dbpath /path/to/data/directory
```

The following collections are used:
- `chat_boxes`: Stores chat metadata
- `chat_messages`: Stores individual messages

### 3. Install Dependencies

#### Backend (Flask)
```
cd backend
pip install -r requirements.txt
```

#### Backend (FastAPI - Alternative)
```
cd backend
pip install -r requirements-fastapi.txt
```

#### Frontend
```
npm install
```

### 4. Run the Application

#### Backend (Flask)
```
cd backend
python app.py
```

#### Backend (FastAPI - Alternative)
```
cd backend
uvicorn fast_api_app:app --reload --port 5000
```

#### Frontend
```
npm run dev
```

## Features

- Chat with multiple AI models (Gemini, Claude, OpenAI)
- System prompts are optional for customizing assistant behavior
- Upload images and files
- Save and manage multiple conversations

## API Implementations

This application integrates with three AI providers:

1. **Google Gemini**: Used for text and multimodal conversations
2. **Anthropic Claude**: Used for detailed, longer-form conversations
3. **OpenAI GPT**: Used for advanced language capabilities

Each API has its own implementation in the `backend/services` directory.

## Troubleshooting

If you encounter issues:

1. Check that your API keys are correctly set in the `.env` file
2. Ensure the MongoDB server is running and accessible
3. Verify the backend server is running and accessible at the expected URL
4. Check browser console and backend logs for error messages
5. Make sure CORS is properly configured if you see CORS errors
