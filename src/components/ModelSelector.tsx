
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { ModelType, useChat } from "@/contexts/ChatContext";
import ModelInfo from "./ModelInfo";
import gsap from "gsap";

interface ModelOption {
  value: ModelType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const models: ModelOption[] = [
  {
    value: "phi3:mini",
    label: "Phi 3 Mini",
    description: "Local Microsoft Phi model",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-500" fill="currentColor">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
      <path d="M2 17L12 22L22 17" />
      <path d="M2 12L12 17L22 12" />
    </svg>
  },
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    description: "Google's latest Gemini model",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
    </svg>
  },
  {
    value: "groq-llama",
    label: "Groq Llama",
    description: "Groq's fast inference model",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-purple-500" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  }
];

export default function ModelSelector() {
  const { currentModel, setCurrentModel } = useChat();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out" }
      );
    }
  }, []);

  const handleSelectModel = (model: ModelType) => {
    if (model !== currentModel) {
      setCurrentModel(model);
    }
    setOpen(false);
  };

  const selectedModel = models.find(m => m.value === currentModel) || models[0];

  return (
    <div ref={containerRef} className="transition-all duration-300">
      <div className="flex items-center gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex justify-between items-center w-full gap-2 h-10 rounded-xl hover:bg-foreground/5 transition-all duration-300 border border-border/40 model-selector-button"
            >
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0">{selectedModel.icon}</span>
                <span className="truncate">{selectedModel.label}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[250px] animate-fade-in rounded-xl overflow-hidden shadow-lg border border-border/40 bg-popover"
            align="end"
            sideOffset={8}
          >
            {models.map((model) => (
              <DropdownMenuItem
                key={model.value}
                className="flex items-center justify-between py-2 cursor-pointer rounded-lg transition-all duration-300 hover:bg-foreground/5 dropdown-item-highlight"
                onClick={() => handleSelectModel(model.value)}
              >
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0">{model.icon}</span>
                  <div>
                    <p className="font-medium">{model.label}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                </div>
                {currentModel === model.value && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ModelInfo />
      </div>
    </div>
  );
}
