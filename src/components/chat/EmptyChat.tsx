
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  onSendMessage: (message: string) => void;
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
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const systemPromptSuggestions = [
    {
      title: "Career Coach",
      prompt: "You are a professional career coach. Help users with career advice, resume tips, interview preparation, and professional development."
    },
    {
      title: "Fitness Trainer",
      prompt: "You are a certified fitness trainer and nutritionist. Help users with workout plans, nutrition advice, and healthy lifestyle tips."
    },
    {
      title: "Study Assistant",
      prompt: "You are an educational tutor. Help users understand complex topics, provide study strategies, and explain concepts clearly."
    },
    {
      title: "Creative Writer",
      prompt: "You are a creative writing assistant. Help users with storytelling, poetry, character development, and creative inspiration."
    }
  ];

  const examplePrompts = [
    "Explain quantum computing in simple terms",
    "Write a short story about a time traveler",
    "Help me plan a healthy meal for the week",
    "What are the latest trends in web development?"
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">AI Assistant</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 overflow-y-auto">
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome to AI Assistant
          </h2>
          <p className="text-lg text-muted-foreground">
            Start a conversation, upload documents for context, or choose from these options:
          </p>
        </div>

        {/* System Prompt Suggestions */}
        <div className="w-full max-w-4xl space-y-4">
          <h3 className="text-lg font-semibold text-center">System Prompt Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemPromptSuggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSystemPrompt(suggestion.prompt)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.prompt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Prompt Section */}
        {showSystemPrompt && (
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">
                System Instructions {isRequired && <span className="text-destructive">*</span>}
              </h3>
              <Textarea
                placeholder="Enter system instructions to customize AI behavior..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Set custom instructions to guide how the AI responds to your messages.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Example Prompts */}
        <div className="w-full max-w-4xl space-y-4">
          <h3 className="text-lg font-semibold text-center">Example Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examplePrompts.map((prompt, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setMessage(prompt)}
              >
                <CardContent className="p-4">
                  <p className="text-sm">{prompt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <div className="relative">
            <Textarea
              placeholder="Type your message here..."
              className="resize-none pr-12 min-h-[60px] max-h-[200px] rounded-xl border border-foreground/20 shadow-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <Button
              size="icon"
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Press Enter to send • Upload documents via the chat input for enhanced context
          </p>
        </form>
      </div>
    </div>
  );
}
