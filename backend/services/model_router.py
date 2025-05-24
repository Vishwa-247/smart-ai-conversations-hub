
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
    
    def should_use_local_model(self, complexity: Dict, resources: Dict) -> bool:
        """Determine if local model should be used"""
        # Check if Ollama is available
        if not self.ollama_service.is_available():
            return False
        
        # Resource thresholds
        if resources["memory_percent"] > 85:
            return False
        
        if resources["cpu_percent"] > 90:
            return False
        
        # For low complexity queries, prefer local
        if complexity["complexity_level"] == "low":
            return True
        
        # For medium complexity, use local if resources are good
        if complexity["complexity_level"] == "medium":
            return resources["memory_percent"] < 70 and resources["cpu_percent"] < 70
        
        # For high complexity, prefer cloud models
        return False
    
    def select_model(self, query: str, has_rag_context: bool = False) -> Dict[str, any]:
        """Select the best model for the query"""
        complexity = self.analyze_query_complexity(query)
        resources = self.get_system_resources()
        
        # Model selection logic
        if self.should_use_local_model(complexity, resources):
            return {
                "type": "local",
                "model": "phi3:mini",
                "service": "ollama",
                "reasoning": f"Local model selected for {complexity['complexity_level']} complexity query with good system resources"
            }
        else:
            # Choose between cloud models based on complexity
            if complexity["complexity_level"] == "high" or len(query.split()) > 100:
                return {
                    "type": "cloud",
                    "model": "gemini-pro",
                    "service": "gemini",
                    "reasoning": f"Gemini selected for {complexity['complexity_level']} complexity query"
                }
            else:
                return {
                    "type": "cloud",
                    "model": "grok-1",
                    "service": "grok",
                    "reasoning": f"Grok selected for {complexity['complexity_level']} complexity query"
                }
    
    def log_performance(self, model_info: Dict, response_time: float, success: bool):
        """Log model performance for future optimization"""
        performance_data = {
            "timestamp": time.time(),
            "model": model_info,
            "response_time": response_time,
            "success": success
        }
        
        self.performance_history.append(performance_data)
        
        # Keep only last 100 entries
        if len(self.performance_history) > 100:
            self.performance_history = self.performance_history[-100:]
    
    def get_performance_stats(self) -> Dict:
        """Get performance statistics"""
        if not self.performance_history:
            return {}
        
        local_performances = [p for p in self.performance_history if p["model"]["type"] == "local"]
        cloud_performances = [p for p in self.performance_history if p["model"]["type"] == "cloud"]
        
        stats = {
            "total_requests": len(self.performance_history),
            "local_requests": len(local_performances),
            "cloud_requests": len(cloud_performances)
        }
        
        if local_performances:
            stats["local_avg_time"] = sum(p["response_time"] for p in local_performances) / len(local_performances)
            stats["local_success_rate"] = sum(1 for p in local_performances if p["success"]) / len(local_performances)
        
        if cloud_performances:
            stats["cloud_avg_time"] = sum(p["response_time"] for p in cloud_performances) / len(cloud_performances)
            stats["cloud_success_rate"] = sum(1 for p in cloud_performances if p["success"]) / len(cloud_performances)
        
        return stats
