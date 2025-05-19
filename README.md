
# AI Chat Application

A modern chat application that allows users to interact with various AI language models through a clean, responsive interface.

## Features

- **Multiple AI Models**: Support for GPT-4o, Claude, Gemini, and Grok models
- **Responsive UI**: Works on desktop and mobile devices
- **Theme Support**: Light and dark mode with smooth transitions
- **Chat History**: View and manage previous conversations
- **Smooth Animations**: Powered by GSAP for a polished user experience
- **Containerized**: Docker and Kubernetes support for easy deployment

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
  - Grok (placeholder)

## Running Locally

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file in the backend directory with the following variables:
# MONGO_URI=mongodb://localhost:27017/
# DB_NAME=ai_chat_db
# GEMINI_API_KEY=your_gemini_api_key
# OPENAI_API_KEY=your_openai_api_key (optional)
# ANTHROPIC_API_KEY=your_anthropic_api_key (optional)

# Start the Flask server
python app.py
```

## Environment Variables

The following environment variables should be added to the `.env` file in the backend directory:

```
MONGO_URI=mongodb://localhost:27017/
DB_NAME=ai_chat_db
GEMINI_API_KEY=AIzaSyD7H1yePFJWYW3zdtk7LktQz7WpBfU9LLc
OPENAI_API_KEY=your_openai_api_key (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key (optional)
```

## Docker Deployment

### Why Docker?

Docker provides a consistent environment for running the application across different systems. It packages all dependencies, configurations, and the application itself into a container that runs the same way regardless of where it's deployed.

### Building and Running with Docker

```bash
# Build the Docker image
docker build -t ai-chat-app .

# Run the container
docker run -p 8080:80 ai-chat-app
```

### Using Docker Compose

For a more complete setup:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── pages/            # Application pages
│   │   └── lib/              # Utility functions
├── backend/
│   ├── .env                  # Environment variables
│   ├── app.py                # Main Flask application
│   ├── database/             # Database connection and operations
│   ├── models/               # Data models
│   ├── routers/              # API endpoints
│   └── services/             # AI service integrations
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Multi-container Docker config
└── README.md                 # Project documentation
```

## Future Enhancements

- User authentication and saved preferences
- Custom system prompts for each AI model
- File upload capabilities
- Voice input/output support
