
import { Button } from "@/components/ui/button";
import SystemPromptInput from "@/components/SystemPromptInput";
import DocumentUpload from "@/components/DocumentUpload";
import ModelInfo from "@/components/ModelInfo";
import ChatInput from "@/components/ChatInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, Zap, Sparkles, Brain, Rocket, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const examplePrompts = [
    {
      text: "Explain quantum computing in simple terms",
      icon: <Brain className="w-4 h-4" />,
      gradient: "from-blue-500/20 to-purple-600/20"
    },
    {
      text: "Summarize my uploaded documents",
      icon: <FileText className="w-4 h-4" />,
      gradient: "from-green-500/20 to-emerald-600/20"
    },
    {
      text: "Help me write a research proposal",
      icon: <Rocket className="w-4 h-4" />,
      gradient: "from-orange-500/20 to-red-600/20"
    },
    {
      text: "Compare different AI models",
      icon: <Sparkles className="w-4 h-4" />,
      gradient: "from-purple-500/20 to-pink-600/20"
    }
  ];

  // Dynamic system prompts based on model type
  const getDynamicSystemPrompt = (modelType: string) => {
    switch (modelType) {
      case 'gemini-pro':
        return "You are a helpful AI assistant powered by Google's Gemini Pro. Provide accurate, detailed responses with a focus on being informative and helpful.";
      case 'grok-1':
        return "You are Grok, an AI assistant with a witty personality. Be helpful while maintaining a conversational and engaging tone.";
      case 'mistral-7b':
        return "You are an AI assistant powered by Mistral 7B. Focus on providing concise, accurate responses with technical depth when needed.";
      case 'phi-3-mini':
        return "You are a compact but powerful AI assistant. Provide clear, efficient responses optimized for quick understanding.";
      default:
        return "You are a helpful AI assistant. Provide accurate and helpful responses to user queries.";
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl backdrop-blur-sm border border-primary/20 shadow-lg">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hybrid AI Agent
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Intelligent model routing with RAG-enhanced responses for comprehensive assistance
            </p>
          </motion.div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Features */}
            <div className="lg:col-span-2 space-y-6">
              {/* System Prompt Section */}
              {showSystemPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-card/60 backdrop-blur-md border-border/40 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-primary" />
                        AI Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SystemPromptInput 
                        value={systemPrompt} 
                        onChange={setSystemPrompt}
                      />
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Quick presets:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSystemPrompt(getDynamicSystemPrompt('gemini-pro'))}
                            className="text-xs"
                          >
                            Gemini Style
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSystemPrompt(getDynamicSystemPrompt('grok-1'))}
                            className="text-xs"
                          >
                            Grok Style
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSystemPrompt("")}
                            className="text-xs"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Document Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-card/60 backdrop-blur-md border-border/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Knowledge Base
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Start Examples */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-card/60 backdrop-blur-md border-border/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {examplePrompts.map((example, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className={`text-left h-auto p-4 justify-start w-full bg-gradient-to-r ${example.gradient} hover:shadow-md border-border/50 transition-all duration-300`}
                            onClick={() => onSendMessage(example.text)}
                            disabled={isLoading}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                {example.icon}
                              </div>
                              <span className="text-sm font-medium">{example.text}</span>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Model Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ModelInfo />
              
              <Card className="bg-card/60 backdrop-blur-md border-border/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {[
                    { label: "Intelligent model routing", color: "bg-green-500" },
                    { label: "Document-aware responses", color: "bg-blue-500" },
                    { label: "Free models only", color: "bg-purple-500" },
                    { label: "Resource optimization", color: "bg-orange-500" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${feature.color} rounded-full`} />
                      <span className="text-muted-foreground">{feature.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Chat Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="border-t border-border/40 bg-background/80 backdrop-blur-sm"
      >
        <ChatInput onSend={onSendMessage} disabled={isLoading} />
      </motion.div>
    </div>
  );
}
