
# AI Chat Application

This is a chat application using multiple AI models like Gemini, Claude, and Grok.

## Setup

### 1. Environment Variables

#### Backend

1. Copy the `.env.example` file to `.env` in the server directory:
   ```
   cp server/.env.example server/.env
   ```
2. Edit the `server/.env` file and add your API keys:
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

#### Backend
```
cd server
pip install -r requirements.txt
```

#### Frontend
```
npm install
```

### 3. Run the Application

#### Backend
```
cd server
python app.py
```

#### Frontend
```
npm run dev
```

## Features

- Chat with multiple AI models (Gemini, Claude, Grok)
- Customize system prompts for each conversation
- Upload images, audio, and other files
- Save and manage multiple conversations

## Troubleshooting

If you encounter issues with model responses:
1. Check that your API keys are correctly set in the `.env` file
2. Ensure the backend server is running and accessible
3. Check browser console for any error messages
