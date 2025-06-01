
import { Message } from "@/contexts/ChatContext";
import ChatMessage from "../ChatMessage";
import SystemPromptInput from "../SystemPromptInput";
import { Loader2 } from "lucide-react";

interface ChatMessageListProps {
  messages: Message[];
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  isEditingSystemPrompt: boolean;
  toggleSystemPromptEditor: () => void;
  handleSaveSystemPrompt: () => void;
  showSystemPrompt: boolean;
  isLoading?: boolean;
  currentModel?: string;
}

export default function ChatMessageList({
  messages,
  systemPrompt,
  setSystemPrompt,
  isEditingSystemPrompt,
  toggleSystemPromptEditor,
  handleSaveSystemPrompt,
  showSystemPrompt,
  isLoading = false,
  currentModel = ""
}: ChatMessageListProps) {
  return (
    <div className="w-full">
      {/* System Prompt Section */}
      {showSystemPrompt && (
        <SystemPromptInput
          value={systemPrompt}
          onChange={setSystemPrompt}
          isEditing={isEditingSystemPrompt}
          toggleEdit={toggleSystemPromptEditor}
          onSave={handleSaveSystemPrompt}
        />
      )}

      {/* Messages */}
      <div className="w-full">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLastMessage={index === messages.length - 1}
          />
        ))}
        
        {/* Inline Loading Indicator - Only show as last message */}
        {isLoading && (
          <div className="py-6 px-4 w-full bg-muted/10">
            <div className="max-w-3xl mx-auto flex gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground" />
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="font-medium text-sm mb-1">
                  {currentModel === 'phi3:mini' ? 'Ollama (Phi3)' : 'Assistant'}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {currentModel === 'phi3:mini' 
                    ? 'Local model is generating response...' 
                    : 'Thinking...'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
