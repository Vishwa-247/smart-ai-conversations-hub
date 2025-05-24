
# Hybrid AI Agent - Professional Chat Application

A sophisticated chat application featuring intelligent model routing, RAG-enhanced responses, and support for multiple free AI models including Gemini Pro, Grok-1, Mistral-7B, and Phi-3 Mini.

## 🚀 Features

- **Intelligent Model Routing**: Automatically selects the best model based on query complexity and context
- **RAG Integration**: Document-aware responses using uploaded knowledge base
- **Multi-Model Support**: Gemini Pro, Grok-1, Mistral-7B, and Phi-3 Mini
- **Professional UI**: Modern, responsive design with multiple themes
- **Real-time Chat**: Seamless conversation experience with typing indicators
- **Document Processing**: Upload and analyze PDF, DOCX, and text files
- **System Prompts**: Dynamic AI behavior customization

## 🏗️ Architecture

### Model Integration

#### Phi-3 Mini Integration
Phi-3 Mini is integrated as a lightweight, efficient model optimized for quick responses:

```python
# Backend integration (backend/services/phi3_service.py)
class Phi3Service:
    def __init__(self):
        self.model_name = "phi-3-mini"
        self.api_endpoint = "https://api.phi3.microsoft.com/v1/chat/completions"
    
    async def generate_response(self, messages, system_prompt=None):
        # Optimized for quick, concise responses
        # Lower token limits for efficiency
        # Enhanced for code and technical queries
```

#### Dynamic Model Switching
The application uses intelligent routing to select the optimal model:

```typescript
// Model selection logic
const selectOptimalModel = (query: string, context: any) => {
  if (query.includes('code') || query.includes('programming')) {
    return 'phi-3-mini'; // Fast for code queries
  }
  if (query.length > 500) {
    return 'gemini-pro'; // Better for complex queries
  }
  if (context.hasDocuments) {
    return 'grok-1'; // Excellent for document analysis
  }
  return 'mistral-7b'; // Balanced default
};
```

### RAG System Architecture

```
User Query → Document Retrieval → Context Injection → Model Selection → Response
     ↓              ↓                    ↓                ↓             ↓
  Embedding    Vector Search      Prompt Building    API Call     Post-processing
```

## 🛠️ Setup Instructions

### 1. Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Configure your API keys in `backend/.env`:
```env
# Core AI Models
GEMINI_API_KEY=your_gemini_api_key_here
GROK_API_KEY=your_grok_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
PHI3_API_KEY=your_phi3_api_key_here

# Database
MONGO_URI=mongodb://localhost:27017/
DB_NAME=ai_chat_db

# Vector Database (for RAG)
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

#### Frontend Environment
```bash
cp .env.example .env
```

Set the API URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Database Setup

The application uses MongoDB for chat storage and ChromaDB for vector embeddings:

```bash
# Start MongoDB
mongod --dbpath /path/to/data

# ChromaDB is embedded and starts automatically
```

### 3. Installation & Startup

#### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

#### Frontend (React + Vite)
```bash
npm install
npm run dev
```

## 🔧 API Configuration

### Model API Endpoints

| Model | Provider | Endpoint | Usage |
|-------|----------|----------|--------|
| Gemini Pro | Google | `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent` | Complex reasoning |
| Grok-1 | xAI | `https://api.x.ai/v1/chat/completions` | Conversational AI |
| Mistral-7B | Mistral AI | `https://api.mistral.ai/v1/chat/completions` | Balanced performance |
| Phi-3 Mini | Microsoft | Custom endpoint | Quick responses |

### RAG System Configuration

```python
# Vector database configuration
CHROMA_SETTINGS = {
    "persist_directory": "./chroma_db",
    "collection_name": "documents",
    "embedding_model": "all-MiniLM-L6-v2",
    "chunk_size": 1000,
    "chunk_overlap": 200
}
```

## 🎨 Professional UI Features

### Theme System
- **Light Theme**: Clean, minimal design with subtle shadows
- **Dark Theme**: Professional dark mode with blue accents
- **Forest Theme**: Nature-inspired green palette

### Component Architecture
```
src/
├── components/
│   ├── chat/
│   │   ├── Chat.tsx              # Main chat interface
│   │   ├── ChatMessageList.tsx   # Message display
│   │   └── EmptyChat.tsx         # Landing page
│   ├── ChatSidebar.tsx           # Navigation sidebar
│   ├── ModelSelector.tsx         # AI model selection
│   └── SystemPromptInput.tsx     # Behavior customization
```

### Professional Design Principles
- **Glassmorphism**: Subtle transparency and blur effects
- **Smooth Transitions**: 300ms cubic-bezier animations
- **Consistent Spacing**: 8px grid system
- **Accessible Colors**: WCAG AA compliant contrast ratios

## 📊 Model Performance Comparison

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| Phi-3 Mini | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Quick queries, code help |
| Mistral-7B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | General purpose |
| Gemini Pro | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Complex reasoning |
| Grok-1 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Conversational AI |

## 🔍 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify all API keys are correctly set in `backend/.env`
   - Check API key validity and quotas

2. **Database Connection**
   - Ensure MongoDB is running on the specified port
   - Check ChromaDB permissions for the persist directory

3. **Model Selection Issues**
   - Verify model API endpoints are accessible
   - Check rate limits for each provider

4. **UI/UX Issues**
   - Clear browser cache for theme changes
   - Ensure responsive design on mobile devices

### Performance Optimization

```typescript
// Model caching for faster responses
const modelCache = new Map();

// Document embedding optimization
const optimizeEmbeddings = (documents) => {
  return documents.map(doc => ({
    ...doc,
    embedding: computeEmbedding(doc.content),
    metadata: extractMetadata(doc)
  }));
};
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
```

### Environment Variables for Production
```env
NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api
REDIS_URL=redis://your-redis-instance
DATABASE_URL=mongodb://your-mongodb-instance
```

## 📈 Future Enhancements

- [ ] Voice chat integration
- [ ] Multi-language support
- [ ] Advanced RAG with graph databases
- [ ] Custom model fine-tuning
- [ ] Team collaboration features
- [ ] Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, FastAPI, and the power of modern AI**
