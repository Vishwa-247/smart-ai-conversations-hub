
# AI Chat Application

A modern chat application that allows users to interact with various AI language models through a clean, responsive interface.

## Features

- **Multiple AI Models**: Support for GPT-4o, Claude, and Gemini models
- **Responsive UI**: Works on desktop and mobile devices
- **Theme Support**: Light and dark mode with smooth transitions
- **Chat History**: View and manage previous conversations
- **Smooth Animations**: Powered by GSAP for a polished user experience

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- TailwindCSS for styling
- GSAP for animations
- React Query for data fetching
- React Markdown for message formatting

### Backend
- Flask for API endpoints
- MongoDB for data storage
- Support for multiple AI services:
  - OpenAI GPT models
  - Google Gemini
  - Anthropic Claude

## Setup Requirements

- Node.js (v16 or higher)
- Python (v3.9 or higher)
- MongoDB (v4.4 or higher)
- API keys for the AI services you plan to use

## Local Setup Instructions

### 1. MongoDB Setup
- Install MongoDB on your system
- Start the MongoDB service:
  ```bash
  # On Windows
  # MongoDB typically runs as a service after installation

  # On macOS
  brew services start mongodb-community

  # On Linux
  sudo systemctl start mongod
  ```
- MongoDB will run on `mongodb://localhost:27017/` by default

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (optional for OpenAI and Claude)
# The .env file should contain:
# OPENAI_API_KEY=your_openai_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
# Note: Gemini API key is hardcoded for development

# Start the Flask server
python app.py
```

### 3. Frontend Setup
```bash
# In the project root directory
npm install

# Start the development server
npm run dev
```

### 4. Access the Application
- Open your browser and go to: `http://localhost:5173`
- The app should connect to the backend at: `http://localhost:5000`

## Using the Application

1. **Start a New Chat**: Click the "New Chat" button in the sidebar
2. **Choose a Model**: Select GPT-4o, Claude, or Gemini from the model selector
3. **Send a Message**: Type your message and press Enter or click the send button
4. **View History**: Previous conversations appear in the sidebar
5. **Toggle Theme**: Switch between light and dark modes using the theme toggle

## Troubleshooting

- **Backend Connection Issues**: Ensure the Flask server is running on port 5000
- **MongoDB Connection Error**: Verify MongoDB is running on the default port
- **Model Response Errors**: Check that you've set up the appropriate API keys

## Project Structure

```
├── src/                  # Frontend React code
│   ├── components/       # React components
│   ├── contexts/         # Context providers
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── pages/            # Application pages
│   └── lib/              # Utility functions
├── server/               # Backend Flask code
│   ├── app.py            # Main Flask application
│   ├── requirements.txt  # Python dependencies
│   ├── db/               # Database connection and operations
│   └── llm_clients/      # AI service integrations
└── README.md             # Project documentation
```
