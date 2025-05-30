
import { Info, Download, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ModelInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Info className="h-4 w-4" />
          <span className="sr-only">Model Setup Info</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Model Setup Instructions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <strong>Phi3 Mini (Local)</strong> - Requires Ollama installation for local processing
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Setting up Phi3 Mini Locally</h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Step 1: Install Ollama</h4>
                <p className="text-sm text-muted-foreground">Download and install Ollama from: <code>https://ollama.ai</code></p>
              </div>
              
              <div>
                <h4 className="font-medium">Step 2: Download Phi3 Mini Model</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">ollama pull phi3:mini</code>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Step 3: Start Ollama Service</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">ollama serve</code>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Step 4: Verify Installation</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">ollama list</code>
                </div>
                <p className="text-sm text-muted-foreground mt-1">You should see phi3:mini in the list</p>
              </div>
            </div>
            
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Ollama runs on localhost:11434 by default. Make sure this port is available.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Other Models</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>Gemini 2.0 Flash:</strong> Cloud-based, requires API key (already configured)</li>
              <li><strong>Groq Llama:</strong> Cloud-based, requires API key (already configured)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
