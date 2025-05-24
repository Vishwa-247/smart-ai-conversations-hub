
import { Button } from "@/components/ui/button";
import SystemPromptInput from "@/components/SystemPromptInput";
import DocumentUpload from "@/components/DocumentUpload";
import ModelInfo from "@/components/ModelInfo";
import ChatInput from "@/components/ChatInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, Zap, Sparkles, Brain, Rocket, Stars } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
  showSystemPrompt: boolean;
  isRequired: boolean;
}

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-primary/30 rounded-full"
    initial={{ 
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: 0.3
    }}
    animate={{
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: [0.3, 0.8, 0.3],
    }}
    transition={{
      duration: 20 + Math.random() * 20,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
  />
);

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    
    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeout = setTimeout(typeText, 50 + Math.random() * 50);
      }
    };
    
    const startTimeout = setTimeout(typeText, delay);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [text, delay]);
  
  return <span>{displayText}</span>;
};

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
      gradient: "from-blue-500 to-purple-600"
    },
    {
      text: "Summarize my uploaded documents",
      icon: <FileText className="w-4 h-4" />,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      text: "Help me write a research proposal",
      icon: <Rocket className="w-4 h-4" />,
      gradient: "from-orange-500 to-red-600"
    },
    {
      text: "Compare different AI models",
      icon: <Sparkles className="w-4 h-4" />,
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="flex h-screen flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20">
        {mounted && Array.from({ length: 15 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 2} />
        ))}
      </div>
      
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 backdrop-blur-[1px]" />
      
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full backdrop-blur-sm border border-primary/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Bot className="h-16 w-16 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Stars className="h-6 w-6 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <TypingText text="Hybrid AI Agent" delay={800} />
              </h1>
              <p className="text-muted-foreground text-xl">
                <TypingText text="Intelligent model routing with RAG-enhanced responses" delay={1500} />
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {/* Main Chat Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* System Prompt */}
              {showSystemPrompt && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="h-5 w-5 text-primary" />
                        </motion.div>
                        System Instructions (Optional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SystemPromptInput 
                        value={systemPrompt} 
                        onChange={setSystemPrompt}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Document Upload */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <FileText className="h-5 w-5 text-blue-500" />
                      </motion.div>
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
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 }}
              >
                <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {examplePrompts.map((example, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className={`text-left h-auto p-4 justify-start w-full bg-gradient-to-r ${example.gradient} bg-opacity-10 hover:bg-opacity-20 border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
                            onClick={() => onSendMessage(example.text)}
                            disabled={isLoading}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="p-2 bg-white/20 rounded-lg"
                              >
                                {example.icon}
                              </motion.div>
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

            {/* Sidebar - Enhanced System Status */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 }}
            >
              <ModelInfo />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    {[
                      { label: "Intelligent model routing", color: "bg-green-500", delay: 0 },
                      { label: "Document-aware responses (RAG)", color: "bg-blue-500", delay: 0.1 },
                      { label: "Free models only", color: "bg-purple-500", delay: 0.2 },
                      { label: "Resource-aware optimization", color: "bg-orange-500", delay: 0.3 }
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + feature.delay }}
                      >
                        <motion.div 
                          className={`w-3 h-3 ${feature.color} rounded-full`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        />
                        <span>{feature.label}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
        className="relative z-10"
      >
        <ChatInput onSend={onSendMessage} disabled={isLoading} />
      </motion.div>
    </div>
  );
}
