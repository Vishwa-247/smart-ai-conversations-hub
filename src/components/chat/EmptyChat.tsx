
import SystemPromptInput from "../SystemPromptInput";
import ChatInput from "../ChatInput";
import ChatSuggestions from "../ChatSuggestions";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  onSendMessage: (content: string, files?: File[]) => void;
  isLoading: boolean;
  showSystemPrompt?: boolean;
  isRequired?: boolean;
}

export default function EmptyChat({
  systemPrompt,
  setSystemPrompt,
  onSendMessage,
  isLoading,
  showSystemPrompt = true,
  isRequired = false
}: EmptyChatProps) {
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="pt-16 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to AI Chat</h1>
            <p className="text-muted-foreground">
              Start a conversation with your AI assistant
            </p>
          </div>
          
          {showSystemPrompt && (
            <SystemPromptInput
              value={systemPrompt}
              onChange={setSystemPrompt}
              required={isRequired}
            />
          )}
          
          <ChatSuggestions 
            onSuggestionClick={handleSuggestionClick}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
