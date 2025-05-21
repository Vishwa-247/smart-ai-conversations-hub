
import { useRef, useEffect } from "react";
import { Message } from "@/contexts/ChatContext";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import SystemPromptInput from "@/components/SystemPromptInput";

interface ChatMessageListProps {
  messages: Message[];
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  isEditingSystemPrompt: boolean;
  toggleSystemPromptEditor: () => void;
  handleSaveSystemPrompt: () => void;
  showSystemPrompt: boolean;
}

export default function ChatMessageList({
  messages,
  systemPrompt,
  setSystemPrompt,
  isEditingSystemPrompt,
  toggleSystemPromptEditor,
  handleSaveSystemPrompt,
  showSystemPrompt
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md text-center p-8 animate-fade-in">
          <div className="mb-6 text-6xl opacity-50 flex justify-center">
            💬
          </div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Start a conversation
          </h2>
          <p className="text-muted-foreground">
            Send a message to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSystemPrompt && (
        <div className="max-w-3xl mx-auto p-4">
          <SystemPromptInput 
            value={systemPrompt} 
            onChange={setSystemPrompt}
          />
        </div>
      )}
      
      {!showSystemPrompt && systemPrompt && (isEditingSystemPrompt || messages.length === 0) && (
        <div className="max-w-3xl mx-auto p-4 animate-fade-in">
          <SystemPromptInput 
            value={systemPrompt}
            onChange={setSystemPrompt}
            onSave={handleSaveSystemPrompt}
            isEditing={isEditingSystemPrompt}
            toggleEdit={toggleSystemPromptEditor}
            readOnly={!isEditingSystemPrompt}
          />
        </div>
      )}
      
      {!showSystemPrompt && systemPrompt && !isEditingSystemPrompt && messages.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSystemPromptEditor}
            className="flex gap-1 text-xs rounded-lg border border-border/50 bg-muted/10"
          >
            <Settings className="h-3 w-3" />
            View/Edit System Instructions
          </Button>
        </div>
      )}
      
      <div className="divide-y divide-border/10">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLastMessage={index === messages.length - 1}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </>
  );
}
