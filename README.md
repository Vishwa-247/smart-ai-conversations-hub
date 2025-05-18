
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

### Build & Deployment
- Docker for containerization
- Kubernetes for orchestration
- Nginx for static file serving

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
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

For a more complete setup (when the backend is implemented):

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Kubernetes Deployment

### Why Kubernetes?

Kubernetes enables scalable, reliable deployments with features like:
- **Horizontal scaling**: Automatically add more instances during high load
- **Self-healing**: Restart containers that fail or become unresponsive
- **Rolling updates**: Update the application without downtime

### Deploying to Kubernetes

```bash
# Apply the Kubernetes configuration
kubectl apply -f kubernetes.yaml

# Check deployment status
kubectl get deployments

# Check pods
kubectl get pods

# Check services
kubectl get services
```

### What Happens After Kubernetes Deployment?

1. **Pods Creation**: Kubernetes creates pods according to your deployment specifications
2. **Service Exposure**: The service makes your pods accessible within the cluster
3. **Ingress Configuration**: The ingress controller routes external traffic to your service
4. **Scaling**: Kubernetes handles scaling based on load or your configuration
5. **Health Monitoring**: Kubernetes monitors container health and restarts failed containers

### Accessing Your Deployed App

Once deployed, the application will be available at the hostname specified in your ingress configuration.

For local testing with minikube:

```bash
# Enable ingress addon
minikube addons enable ingress

# Get minikube IP
minikube ip

# Add hosts entry (replace with your minikube IP)
# 192.168.49.2 chat-app.example.com

# Access the app at http://chat-app.example.com
```

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── contexts/         # Context providers
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── pages/            # Application pages
│   └── lib/              # Utility functions
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-container Docker config
├── kubernetes.yaml       # Kubernetes deployment config
└── nginx.conf            # Nginx server configuration
```

## Future Enhancements

- Backend implementation with Flask and MongoDB
- User authentication and saved preferences
- Custom system prompts for each AI model
- File upload capabilities
- Voice input/output support
