
import { useChat } from "@/contexts/ChatContext";
import SystemPromptInput from "@/components/SystemPromptInput";
import ChatInput from "@/components/ChatInput";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  onSendMessage: (content: string, files?: File[]) => void;
  isLoading: boolean;
  showSystemPrompt: boolean;
  isRequired?: boolean;
}

export default function EmptyChat({
  systemPrompt,
  setSystemPrompt,
  onSendMessage,
  isLoading,
  showSystemPrompt,
  isRequired = false
}: EmptyChatProps) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-md text-center p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Welcome to AI Chat</h2>
          <p className="text-muted-foreground mb-6">
            {isRequired 
              ? "Define how your AI assistant should behave before starting the conversation." 
              : "Start a new conversation with any of our AI models."}
          </p>
          <div className="mb-6">
            <SystemPromptInput 
              value={systemPrompt} 
              onChange={setSystemPrompt} 
              required={isRequired}
              readOnly={false}
            />
          </div>
          <ChatInput 
            onSend={(content, files) => {
              // Use user message as system prompt if system prompt is empty
              if (isRequired && !systemPrompt.trim()) {
                setSystemPrompt(content);
              }
              onSendMessage(content, files);
            }} 
            disabled={isLoading || (isRequired && !systemPrompt.trim())} 
          />
        </div>
      </div>
    </div>
  );
}
