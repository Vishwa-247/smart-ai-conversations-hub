
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import DocumentUpload from "@/components/DocumentUpload";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  onSendMessage: (content: string, files?: File[]) => void;
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
  const [input, setInput] = useState("");
  const [isSystemPromptMode, setIsSystemPromptMode] = useState(true);
  const { toast } = useToast();

  const handleSend = () => {
    if (!input.trim()) return;

    if (isSystemPromptMode && showSystemPrompt) {
      // First message: set as system prompt
      setSystemPrompt(input.trim());
      setIsSystemPromptMode(false);
      setInput("");
      toast({
        title: "System prompt set",
        description: "Now you can start chatting with your custom instructions",
        duration: 3000,
      });
    } else {
      // Regular message
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMode = isSystemPromptMode && showSystemPrompt;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        <div className="text-center space-y-4 max-w-2xl">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
          </div>
          
          {currentMode ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                    Set System Instructions (Optional)
                  </h3>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your first message will set the AI's behavior and personality for this entire conversation.
                  You can also skip this and start chatting directly.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Ready to chat! Your system instructions are set.
              </p>
              {systemPrompt && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <strong>Current instructions:</strong> {systemPrompt.slice(0, 100)}
                  {systemPrompt.length > 100 && "..."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Upload Section */}
        <div className="w-full max-w-2xl">
          <DocumentUpload 
            onUploadSuccess={(filename, chunkCount) => {
              toast({
                title: "Document uploaded",
                description: `${filename} is now available for AI queries`,
                duration: 5000,
              });
            }}
          />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                currentMode
                  ? "Set system instructions (e.g., 'You are a helpful coding assistant..') or start chatting directly"
                  : "Type your message..."
              }
              className={`pr-12 min-h-[80px] resize-none ${
                currentMode ? "border-blue-300 focus:border-blue-500" : ""
              }`}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {currentMode && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                💡 Tip: System instructions shape how the AI responds throughout the conversation
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSystemPromptMode(false);
                  toast({
                    title: "Skipped system prompt",
                    description: "You can set instructions later in chat settings",
                    duration: 3000,
                  });
                }}
                className="text-xs h-6"
              >
                Skip & Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
