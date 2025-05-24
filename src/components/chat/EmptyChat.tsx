
import { Button } from "@/components/ui/button";
import SystemPromptInput from "@/components/SystemPromptInput";
import DocumentUpload from "@/components/DocumentUpload";
import ModelInfo from "@/components/ModelInfo";
import ChatInput from "@/components/ChatInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, Zap } from "lucide-react";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
  showSystemPrompt: boolean;
  isRequired: boolean;
}

export default function EmptyChat({
  systemPrompt,
  setSystemPrompt,
  onSendMessage,
  isLoading,
  showSystemPrompt,
  isRequired
}: EmptyChatProps) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Bot className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Hybrid AI Agent</h1>
              <p className="text-muted-foreground text-lg">
                Intelligent model routing with RAG-enhanced responses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* System Prompt */}
              {showSystemPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      System Instructions (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemPromptInput 
                      value={systemPrompt} 
                      onChange={setSystemPrompt}
                      placeholder="Set custom instructions for the AI assistant (optional)"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Document Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
              </Card>

              {/* Quick Start Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Explain quantum computing in simple terms",
                      "Summarize my uploaded documents",
                      "Help me write a research proposal",
                      "Compare different AI models"
                    ].map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left h-auto p-4 justify-start"
                        onClick={() => onSendMessage(example)}
                        disabled={isLoading}
                      >
                        <span className="text-sm">{example}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - System Status */}
            <div className="space-y-6">
              <ModelInfo />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Features</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Intelligent model routing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Document-aware responses (RAG)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Local + Cloud models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Resource-aware optimization</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
