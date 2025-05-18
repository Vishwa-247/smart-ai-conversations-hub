
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ModelType, useChat } from "@/contexts/ChatContext";

interface ModelOption {
  value: ModelType;
  label: string;
  description: string;
}

const models: ModelOption[] = [
  {
    value: "gpt-4o",
    label: "GPT-4o",
    description: "Most capable model for complex tasks",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Faster and more cost-effective",
  },
  {
    value: "claude-3-sonnet",
    label: "Claude 3 Sonnet",
    description: "Balanced performance and reasoning",
  },
  {
    value: "gemini-pro",
    label: "Gemini Pro",
    description: "Google's advanced AI model",
  },
  {
    value: "grok-1",
    label: "Grok-1",
    description: "X's conversational AI assistant",
  },
];

export default function ModelSelector() {
  const { currentModel, setCurrentModel, currentChatId, chats } = useChat();
  const [open, setOpen] = useState(false);

  const handleSelectModel = (model: ModelType) => {
    setCurrentModel(model);
    setOpen(false);
  };

  // Get the current model details
  const selectedModel = models.find(m => m.value === currentModel);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex justify-between items-center w-full gap-2 h-10">
          <span className="truncate">{selectedModel?.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[250px] animate-fade-in"
        align="end"
        sideOffset={8}
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.value}
            className="flex items-center justify-between py-2"
            onClick={() => handleSelectModel(model.value)}
          >
            <div>
              <p className="font-medium">{model.label}</p>
              <p className="text-xs text-muted-foreground">{model.description}</p>
            </div>
            {currentModel === model.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
