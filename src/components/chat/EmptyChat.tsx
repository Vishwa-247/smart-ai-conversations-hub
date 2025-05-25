
import ChatInput from "@/components/ChatInput";
import { Bot } from "lucide-react";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
  showSystemPrompt: boolean;
  isRequired: boolean;
}

export default function EmptyChat({
  systemPrompt,
  setSystemPrompt,
  onSendMessage,
  isLoading,
  showSystemPrompt,
  isRequired
}: EmptyChatProps) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Bot className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Chat Assistant</h1>
              <p className="text-muted-foreground text-lg">
                Start a conversation with your AI assistant
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
