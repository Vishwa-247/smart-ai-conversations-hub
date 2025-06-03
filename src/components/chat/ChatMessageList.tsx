
import { useState, useEffect, useRef } from "react";
import { Message } from "@/contexts/ChatContext";
import ChatMessage from "@/components/ChatMessage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SystemPromptInput from "@/components/SystemPromptInput";
import { ModelType } from "@/services/types";

interface ChatMessageListProps {
  messages: Message[];
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  isEditingSystemPrompt: boolean;
  toggleSystemPromptEditor: () => void;
  handleSaveSystemPrompt: () => void;
  showSystemPrompt: boolean;
  isLoading: boolean;
  currentModel: ModelType;
  onRewrite?: (message: string) => void;
  onRegenerate?: (messageIndex: number) => void;
}

export default function ChatMessageList({
  messages,
  systemPrompt,
  setSystemPrompt,
  isEditingSystemPrompt,
  toggleSystemPromptEditor,
  handleSaveSystemPrompt,
  showSystemPrompt,
  isLoading,
  currentModel,
  onRewrite,
  onRegenerate,
}: ChatMessageListProps) {
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRegenerate = (messageIndex: number) => {
    console.log('Regenerating message at index:', messageIndex);
    if (onRegenerate) {
      onRegenerate(messageIndex);
    }
  };

  const handleRewrite = (messageContent: string) => {
    if (onRewrite) {
      onRewrite(messageContent);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* System Prompt Section */}
      {showSystemPrompt && (
        <div className="p-4 border-b border-border/30 bg-muted/5">
          <div className="max-w-3xl mx-auto">
            <SystemPromptInput
              value={systemPrompt}
              onChange={setSystemPrompt}
              onSave={handleSaveSystemPrompt}
              isEditing={isEditingSystemPrompt}
              toggleEdit={toggleSystemPromptEditor}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.role}-${index}`}
          message={message}
          messageIndex={index}
          isLastMessage={index === messages.length - 1}
          onRegenerate={() => handleRegenerate(index)}
          onRewrite={handleRewrite}
        />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-6 px-4 bg-muted/10">
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="font-medium text-sm mb-1">{currentModel}</div>
              <div className="text-muted-foreground text-sm">Thinking...</div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
