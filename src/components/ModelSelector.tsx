
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
import gsap from "gsap";

interface ModelOption {
  value: ModelType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const models: ModelOption[] = [
  {
    value: "gpt-4o",
    label: "ChatGPT",
    description: "Balanced performance for most tasks",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-500" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  },
  {
    value: "gemini-pro",
    label: "Gemini",
    description: "Google's advanced AI model",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" fill="currentColor">
      <path d="M11.9996 1.872L1.872 11.9996L11.9996 22.1272L22.1272 11.9996L11.9996 1.872ZM11.9996 4.96338L19.036 11.9996L11.9996 19.036L4.96338 11.9996L11.9996 4.96338Z" />
      <path d="M11.9996 8.05618L8.05618 11.9996L11.9996 15.9432L15.9432 11.9996L11.9996 8.05618Z" />
    </svg>
  },
  {
    value: "claude-3-sonnet",
    label: "Claude",
    description: "Known for long-form content",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-purple-500" fill="currentColor">
      <path d="M17.0024 0C15.7001 2.28271e-05 14.4542 0.503247 13.5168 1.41462L2.06557 12.5072C0.725636 13.8071 0 15.5948 0 17.4611C0 19.3273 0.725636 21.115 2.06557 22.4149C3.40551 23.7148 5.24936 24.4225 7.17409 24.4225C9.09882 24.4225 10.9427 23.7148 12.2826 22.4149L23.7338 11.3223C24.0885 10.9776 24.0885 10.4257 23.7338 10.081C23.3792 9.73627 22.8113 9.73627 22.4566 10.081L10.9994 21.1796C10.0651 22.0879 8.82588 22.5905 7.52709 22.5911C6.22831 22.5918 4.98832 22.0904 4.05276 21.183C3.11721 20.2757 2.60023 19.0689 2.60099 17.8042C2.60174 16.5396 3.12016 15.3333 4.05661 14.4272L15.5049 3.33865C16.111 2.75046 16.9273 2.41928 17.7767 2.41928C18.6262 2.41928 19.4425 2.75046 20.0486 3.33865C20.6547 3.92685 20.9961 4.71916 20.9961 5.54328C20.9961 6.36741 20.6547 7.15972 20.0486 7.74791L8.60339 18.864C8.29258 19.1645 7.88284 19.3316 7.45551 19.3316C7.02819 19.3316 6.61845 19.1645 6.30764 18.864C5.99683 18.5636 5.82256 18.1674 5.82256 17.7543C5.82256 17.3413 5.99683 16.9451 6.30764 16.6446L16.1127 7.1599C16.4674 6.81516 16.4674 6.26326 16.1127 5.91853C15.758 5.57379 15.1902 5.57379 14.8355 5.91853L5.03046 15.4032C4.42435 15.9914 4.0829 16.7837 4.0829 17.6078C4.0829 18.432 4.42435 19.2243 5.03046 19.8125C5.63657 20.4007 6.45286 20.7319 7.30226 20.7319C8.15166 20.7319 8.96795 20.4007 9.57406 19.8125L21.0223 8.70037C21.9566 7.79208 22.4748 6.56366 22.4748 5.28418C22.4748 4.00469 21.9566 2.77627 21.0223 1.86798C20.0879 0.959695 18.8289 0.459695 17.5114 0.459695L17.0024 0Z" />
    </svg>
  },
  {
    value: "grok-1",
    label: "Grok",
    description: "X's conversational AI assistant",
    icon: <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-500" fill="currentColor">
      <path d="M14.5,8.5L10.5,7L9,11L13,12.5L14.5,8.5M21.3,2.7L18.7,5.3L23,9.6L21.3,11.3L17,7L12.9,11.1L11,17.9L14,20.8L12.9,22L6.4,15.5L8.6,13.3L6.4,11.1L9.9,7.6L7,4.7L8.7,3L13,7.3L16.3,4L21.3,2.7Z" />
    </svg>
  },
];

export default function ModelSelector() {
  const { currentModel, setCurrentModel, createChat } = useChat();
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
      createChat(model); // Start a new chat with the selected model
    }
    setOpen(false);
  };

  // Get the current model details
  const selectedModel = models.find(m => m.value === currentModel) || models[0];

  return (
    <div ref={containerRef} className="transition-all duration-300">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex justify-between items-center w-full gap-2 h-10 rounded-xl hover:bg-accent/10 transition-all duration-200 border border-border/40">
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
              className="flex items-center justify-between py-2 cursor-pointer rounded-lg transition-all duration-200 hover:bg-accent/10"
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
    </div>
  );
}
