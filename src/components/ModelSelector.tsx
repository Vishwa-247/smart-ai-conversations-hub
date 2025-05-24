
import { Check, ChevronDown, Zap, Brain, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { ModelType, useChat } from "@/contexts/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

interface ModelOption {
  value: ModelType;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'online' | 'offline' | 'local';
  speed: 'fast' | 'medium' | 'slow';
  capability: string;
  gradient: string;
}

const models: ModelOption[] = [
  {
    value: "gemini-pro",
    label: "Gemini Pro",
    description: "Google's most advanced free AI",
    icon: <Sparkles className="h-5 w-5" />,
    status: 'online',
    speed: 'fast',
    capability: 'General Purpose',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    value: "grok-1",
    label: "Grok",
    description: "X's conversational AI with humor",
    icon: <Zap className="h-5 w-5" />,
    status: 'online',
    speed: 'medium',
    capability: 'Creative & Witty',
    gradient: 'from-red-500 to-orange-500'
  },
  {
    value: "mistral-7b",
    label: "Mistral 7B",
    description: "Open-source powerhouse",
    icon: <Brain className="h-5 w-5" />,
    status: 'online',
    speed: 'fast',
    capability: 'Code & Analysis',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    value: "phi-3-mini",
    label: "Phi-3 Mini",
    description: "Microsoft's local model",
    icon: <Cpu className="h-5 w-5" />,
    status: 'local',
    speed: 'medium',
    capability: 'Local & Private',
    gradient: 'from-purple-500 to-pink-600'
  },
];

export default function ModelSelector() {
  const { currentModel, setCurrentModel, createChat } = useChat();
  const [open, setOpen] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<ModelType | null>(null);

  const handleSelectModel = (model: ModelType) => {
    if (model !== currentModel) {
      setCurrentModel(model);
      createChat(model);
    }
    setOpen(false);
  };

  const selectedModel = models.find(m => m.value === currentModel) || models[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'local': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'slow': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div 
      className="transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`flex justify-between items-center w-full gap-2 h-auto p-4 rounded-xl hover:bg-foreground/5 transition-all duration-300 border border-border/40 bg-gradient-to-r ${selectedModel.gradient} bg-opacity-10 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex-shrink-0 p-2 rounded-lg bg-white/20 backdrop-blur-sm"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {selectedModel.icon}
              </motion.div>
              <div className="text-left">
                <div className="font-semibold text-foreground">{selectedModel.label}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedModel.status)}`}></div>
                  <span className={getSpeedColor(selectedModel.speed)}>{selectedModel.speed}</span>
                  <span>•</span>
                  <span>{selectedModel.capability}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[320px] p-2 rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-popover/95 backdrop-blur-lg"
          align="end"
          sideOffset={8}
        >
          <AnimatePresence>
            {models.map((model, index) => (
              <motion.div
                key={model.value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DropdownMenuItem
                  className="flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all duration-300 hover:bg-foreground/5 group"
                  onClick={() => handleSelectModel(model.value)}
                  onMouseEnter={() => setHoveredModel(model.value)}
                  onMouseLeave={() => setHoveredModel(null)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${model.gradient} text-white`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {model.icon}
                    </motion.div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {model.label}
                        {currentModel === model.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500"
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(model.status)}`}></div>
                        <span className={`text-xs ${getSpeedColor(model.speed)}`}>{model.speed}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{model.capability}</span>
                      </div>
                    </div>
                  </div>
                  {hoveredModel === model.value && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs bg-primary/20 px-2 py-1 rounded-full"
                    >
                      Select
                    </motion.div>
                  )}
                </DropdownMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
