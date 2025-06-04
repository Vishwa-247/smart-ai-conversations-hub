
import time
import psutil
try:
    import pynvml
    NVIDIA_ML_AVAILABLE = True
except ImportError:
    NVIDIA_ML_AVAILABLE = False

from typing import Dict, List, Optional
from services.ollama_service import OllamaService

class ModelRouter:
    def __init__(self):
        self.ollama_service = OllamaService()
        self.performance_history = []
        
        # Initialize NVIDIA ML if available
        if NVIDIA_ML_AVAILABLE:
            try:
                pynvml.nvmlInit()
            except:
                pass
        
    def analyze_query_complexity(self, query: str) -> Dict[str, any]:
        """Analyze query to determine complexity"""
        words = query.split()
        
        # Technical terms that might need more powerful models
        technical_terms = [
            'algorithm', 'implementation', 'code', 'programming', 'technical',
            'research', 'analysis', 'complex', 'detailed', 'comprehensive'
        ]
        
        complexity_score = 0
        
        # Length factor
        if len(words) > 50:
            complexity_score += 2
        elif len(words) > 20:
            complexity_score += 1
        
        # Technical terms factor
        technical_count = sum(1 for word in words if word.lower() in technical_terms)
        complexity_score += technical_count
        
        # Question complexity
        if any(phrase in query.lower() for phrase in ['how to', 'explain', 'what is', 'why']):
            complexity_score += 1
        
        if any(phrase in query.lower() for phrase in ['detailed', 'comprehensive', 'in-depth']):
            complexity_score += 2
        
        return {
            "score": complexity_score,
            "length": len(words),
            "technical_terms": technical_count,
            "complexity_level": "high" if complexity_score >= 4 else "medium" if complexity_score >= 2 else "low"
        }
    
    def analyze_search_need(self, query: str) -> Dict[str, any]:
        """Analyze if query needs web search"""
        search_indicators = [
            'latest', 'recent', 'current', 'today', 'now', 'breaking',
            'weather', 'stock', 'price', 'news', 'trending', 'happening'
        ]
        
        query_lower = query.lower()
        search_score = sum(1 for indicator in search_indicators if indicator in query_lower)
        
        # Check for real-time question patterns
        realtime_patterns = [
            'what is the current',
            'latest news',
            'today\'s weather',
            'stock price',
            'how much does',
            'when did'
        ]
        
        pattern_match = any(pattern in query_lower for pattern in realtime_patterns)
        
        return {
            "needs_search": search_score > 0 or pattern_match,
            "search_score": search_score,
            "pattern_match": pattern_match,
            "reasoning": f"Search indicators: {search_score}, Pattern match: {pattern_match}"
        }
    
    def get_system_resources(self) -> Dict[str, any]:
        """Get current system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            gpu_info = {"available": False, "memory_used": 0, "memory_total": 0}
            
            if NVIDIA_ML_AVAILABLE:
                try:
                    device_count = pynvml.nvmlDeviceGetCount()
                    if device_count > 0:
                        handle = pynvml.nvmlDeviceGetHandleByIndex(0)  # Use first GPU
                        memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
                        utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
                        
                        gpu_info = {
                            "available": True,
                            "memory_used": memory_info.used // (1024**2),  # Convert to MB
                            "memory_total": memory_info.total // (1024**2),  # Convert to MB
                            "utilization": utilization.gpu
                        }
                except Exception as e:
                    print(f"Error getting GPU info: {e}")
            
            return {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "gpu": gpu_info
            }
        except Exception as e:
            print(f"Error getting system resources: {e}")
            return {"cpu_percent": 50, "memory_percent": 50, "memory_available_gb": 8}
    
    def select_model(self, query: str, has_rag_context: bool = False, needs_web_search: bool = False) -> Dict[str, any]:
        """Select the best model for the query - simplified to always use Phi model"""
        complexity = self.analyze_query_complexity(query)
        search_analysis = self.analyze_search_need(query)
        
        reasoning_parts = []
        
        if needs_web_search or search_analysis["needs_search"]:
            reasoning_parts.append("Query requires real-time information")
        
        if has_rag_context:
            reasoning_parts.append("Enhanced with document context")
        
        if complexity["complexity_level"] == "high":
            reasoning_parts.append("High complexity query detected")
        
        reasoning = ", ".join(reasoning_parts) if reasoning_parts else "Standard query processing"
        
        # Always use local Phi model for simplicity
        if self.ollama_service.is_available():
            return {
                "type": "local",
                "model": "phi3:mini",
                "service": "ollama",
                "reasoning": f"Using local Phi model - {reasoning}",
                "complexity": complexity,
                "search_analysis": search_analysis
            }
        else:
            return {
                "type": "local",
                "model": "phi3:mini", 
                "service": "ollama",
                "reasoning": "Ollama service not available - please ensure Ollama is running with phi3:mini model",
                "complexity": complexity,
                "search_analysis": search_analysis
            }
    
    def log_performance(self, model_info: Dict, response_time: float, success: bool, used_web_search: bool = False):
        """Log model performance for future optimization"""
        performance_data = {
            "timestamp": time.time(),
            "model": model_info,
            "response_time": response_time,
            "success": success,
            "used_web_search": used_web_search
        }
        
        self.performance_history.append(performance_data)
        
        # Keep only last 100 entries
        if len(self.performance_history) > 100:
            self.performance_history = self.performance_history[-100:]
    
    def get_performance_stats(self) -> Dict:
        """Get performance statistics"""
        if not self.performance_history:
            return {
                "total_requests": 0,
                "local_requests": 0,
                "cloud_requests": 0,
                "web_search_requests": 0
            }
        
        local_performances = [p for p in self.performance_history if p["model"]["type"] == "local"]
        web_search_requests = [p for p in self.performance_history if p.get("used_web_search", False)]
        
        stats = {
            "total_requests": len(self.performance_history),
            "local_requests": len(local_performances),
            "cloud_requests": 0,  # No cloud requests in simplified version
            "web_search_requests": len(web_search_requests)
        }
        
        if local_performances:
            stats["local_avg_time"] = sum(p["response_time"] for p in local_performances) / len(local_performances)
            stats["local_success_rate"] = sum(1 for p in local_performances if p["success"]) / len(local_performances)
        
        if web_search_requests:
            stats["web_search_avg_time"] = sum(p["response_time"] for p in web_search_requests) / len(web_search_requests)
            stats["web_search_success_rate"] = sum(1 for p in web_search_requests if p["success"]) / len(web_search_requests)
        
        return stats
