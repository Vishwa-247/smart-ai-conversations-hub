
# Deployment Guide for Vercel

## Prerequisites
- Vercel account
- MongoDB Atlas account (for production database)
- API keys for AI services (Gemini, Groq, etc.)

## Environment Variables Setup

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
```

### Backend Environment Variables (Set in Vercel Dashboard)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ENVIRONMENT=production
```

## Deployment Steps

1. **Setup MongoDB Atlas:**
   - Create a MongoDB Atlas cluster
   - Get the connection string
   - Whitelist Vercel's IP ranges or use 0.0.0.0/0 for all IPs

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy both frontend and backend

3. **Configure CORS:**
   - Update the CORS origins in `backend/main.py` with your actual domain

4. **Test Mobile Responsiveness:**
   - Verify sidebar works on mobile
   - Check that Ollama models show appropriate error on mobile
   - Ensure all content fits within mobile viewport

## Mobile Considerations
- Ollama models are automatically disabled on mobile devices
- Users are prompted to use Gemini or Groq models instead
- Sidebar collapses properly on mobile with overlay

## Post-Deployment Checklist
- [ ] Test all AI models (except Ollama on mobile)
- [ ] Verify chat persistence
- [ ] Check mobile responsiveness
- [ ] Test file uploads
- [ ] Verify web search functionality
- [ ] Test theme switching
