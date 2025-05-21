
import { useChat } from "@/contexts/ChatContext";
import SystemPromptInput from "@/components/SystemPromptInput";
import ChatInput from "@/components/ChatInput";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  onSendMessage: (content: string, files?: File[]) => void;
  isLoading: boolean;
  showSystemPrompt: boolean;
}

export default function EmptyChat({
  systemPrompt,
  setSystemPrompt,
  onSendMessage,
  isLoading,
  showSystemPrompt
}: EmptyChatProps) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-md text-center p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Welcome to AI Chat</h2>
          <p className="text-muted-foreground mb-6">
            Start a new conversation with any of our AI models.
          </p>
          {showSystemPrompt && (
            <div className="mb-6">
              <SystemPromptInput 
                value={systemPrompt} 
                onChange={setSystemPrompt} 
              />
            </div>
          )}
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
