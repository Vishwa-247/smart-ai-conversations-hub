
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

interface EmptyChatProps {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  showSystemPrompt: boolean;
  isRequired?: boolean;
}

const SYSTEM_PROMPT_SUGGESTIONS = [
  {
    title: "Career Coach",
    prompt: "You are a professional career coach with expertise in helping people advance their careers, find new opportunities, and develop professional skills. Provide actionable advice, industry insights, and personalized guidance."
  },
  {
    title: "Fitness & Wellness Coach", 
    prompt: "You are a certified fitness and wellness coach specializing in creating personalized workout plans, nutrition guidance, and healthy lifestyle habits. Focus on sustainable, science-based approaches to health and fitness."
  },
  {
    title: "Creative Writing Assistant",
    prompt: "You are a creative writing mentor with extensive experience in storytelling, character development, and various writing genres. Help users craft compelling narratives, improve their writing style, and overcome creative blocks."
  },
  {
    title: "Learning & Study Tutor",
    prompt: "You are an experienced educator and learning specialist who excels at breaking down complex topics, creating study strategies, and adapting teaching methods to different learning styles. Make learning engaging and effective."
  },
  {
    title: "Business Strategy Advisor",
    prompt: "You are a seasoned business consultant with expertise in strategic planning, market analysis, and business development. Provide insights on growth strategies, problem-solving, and decision-making for businesses of all sizes."
  },
  {
    title: "Technology Expert",
    prompt: "You are a knowledgeable technology expert with deep understanding of software development, emerging tech trends, and digital solutions. Explain complex technical concepts clearly and provide practical implementation advice."
  }
];

export default function EmptyChat({
  systemPrompt,
  setSystemPrompt,
  onSendMessage,
  isLoading,
  showSystemPrompt,
  isRequired = false
}: EmptyChatProps) {
  const [userMessage, setUserMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (userMessage.trim() && !isLoading) {
      onSendMessage(userMessage);
      setUserMessage("");
    }
  };

  const handleSystemPromptSelect = (suggestion: typeof SYSTEM_PROMPT_SUGGESTIONS[0]) => {
    setSystemPrompt(suggestion.prompt);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold">
            <Sparkles className="h-8 w-8 text-primary" />
            <span>AI Assistant</span>
          </div>
          <p className="text-lg text-muted-foreground">
            Choose a system prompt to customize your AI assistant's role and expertise
          </p>
        </div>

        {/* System Prompt Section */}
        {showSystemPrompt && (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">
                System Prompt {isRequired && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                placeholder="Define how the AI should behave and respond..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* System Prompt Suggestions */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Quick Setup - Choose a Role:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SYSTEM_PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start hover:bg-transparent border-border/30 transition-all duration-300 hover:border-primary/30"
                    onClick={() => handleSystemPromptSelect(suggestion)}
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {suggestion.prompt}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Start a conversation..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="resize-none pr-12"
              rows={3}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
              disabled={!userMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
