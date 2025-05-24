
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, HardDrive, Zap, RefreshCw } from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface PerformanceStats {
  total_requests?: number;
  local_requests?: number;
  cloud_requests?: number;
  local_avg_time?: number;
  cloud_avg_time?: number;
  local_success_rate?: number;
  cloud_success_rate?: number;
}

interface SystemResources {
  cpu_percent: number;
  memory_percent: number;
  memory_available_gb: number;
  gpu?: {
    available: boolean;
    memory_used?: number;
    memory_total?: number;
    utilization?: number;
  };
}

interface StatsData {
  performance: PerformanceStats;
  system_resources: SystemResources;
  ollama_available: boolean;
  installed_models: string[];
}

export default function ModelInfo() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<StatsData>('/performance-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const { performance, system_resources, ollama_available, installed_models } = stats;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              System Status
            </div>
            <Button variant="ghost" size="sm" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">CPU Usage</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(system_resources.cpu_percent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{system_resources.cpu_percent.toFixed(1)}%</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(system_resources.memory_percent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {system_resources.memory_percent.toFixed(1)}% 
                ({system_resources.memory_available_gb.toFixed(1)}GB available)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Models</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={ollama_available ? "default" : "secondary"}>
                Local (Ollama): {ollama_available ? "Available" : "Offline"}
              </Badge>
              <Badge variant="default">Gemini: Available</Badge>
              <Badge variant="default">Grok: Available</Badge>
            </div>
          </div>

          {installed_models.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Local Models</h4>
              <div className="flex flex-wrap gap-1">
                {installed_models.map((model) => (
                  <Badge key={model} variant="outline" className="text-xs">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {performance.total_requests && performance.total_requests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performance Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs space-y-1">
              <p>Total Requests: {performance.total_requests}</p>
              <p>Local: {performance.local_requests || 0} | Cloud: {performance.cloud_requests || 0}</p>
            </div>
            
            {performance.local_avg_time && (
              <div className="text-xs">
                <p>Local Avg: {performance.local_avg_time.toFixed(2)}s</p>
                <p>Success Rate: {((performance.local_success_rate || 0) * 100).toFixed(1)}%</p>
              </div>
            )}
            
            {performance.cloud_avg_time && (
              <div className="text-xs">
                <p>Cloud Avg: {performance.cloud_avg_time.toFixed(2)}s</p>
                <p>Success Rate: {((performance.cloud_success_rate || 0) * 100).toFixed(1)}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
