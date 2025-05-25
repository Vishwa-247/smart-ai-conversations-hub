
# Local Development Setup Guide

## Prerequisites
1. **Python 3.8+** installed
2. **Node.js 16+** and npm/yarn installed
3. **MongoDB** running locally
4. **Ollama** installed and running (for phi3:mini model)

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys:
# - GROK_API_KEY=your_grok_api_key_here
# - GEMINI_API_KEY=your_gemini_api_key_here
# - OPENAI_API_KEY=your_openai_api_key_here (optional)
```

### 3. Install and Configure Ollama
```bash
# Install Ollama (visit https://ollama.ai for instructions)
# After installation, pull the phi3:mini model:
ollama pull phi3:mini

# Verify Ollama is running:
curl http://localhost:11434/api/tags
```

### 4. Start MongoDB
```bash
# If using Docker:
docker run -d -p 27017:27017 --name mongodb mongo

# Or start your local MongoDB service
```

### 5. Start Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend  # or root directory
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

## Verification

### 1. Check Health Endpoint
Visit: http://localhost:8000/api/health

Should return:
```json
{
  "status": "ok",
  "services": {
    "ollama": true,
    "rag": true,
    "document_processor": true,
    "mongodb": true
  }
}
```

### 2. Test Models
1. **Gemini**: Should work immediately with API key
2. **Phi3:mini**: Requires Ollama running with model pulled
3. **Grok**: Requires Grok API key

### 3. Test Features
1. **Chat History**: Create a chat, refresh page, history should persist
2. **Document Upload**: Upload a PDF/TXT file, should be processed
3. **System Prompts**: Edit system prompt in settings, should save

## Troubleshooting

### Ollama Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
ollama serve

# Pull model again if needed
ollama pull phi3:mini
```

### MongoDB Issues
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Restart MongoDB service
sudo systemctl restart mongod
```

### API Key Issues
- Ensure all API keys are properly set in `.env`
- Check API key permissions and quotas
- Verify environment variables are loaded: `python -c "import os; print(os.getenv('GROK_API_KEY'))"`

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if backend is accessible
curl http://localhost:8000/api/health
```

## Performance Tips
1. Keep MongoDB indexes optimized
2. Monitor Ollama memory usage
3. Use document chunking for large files
4. Enable caching for repeated queries
