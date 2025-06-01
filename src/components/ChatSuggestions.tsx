
import { Button } from "@/components/ui/button";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  isLoading?: boolean;
}

const suggestions = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are the latest trends in web development?",
  "Help me debug this JavaScript code",
  "Create a business plan outline",
  "Summarize the benefits of React hooks"
];

export default function ChatSuggestions({ onSuggestionClick, isLoading = false }: ChatSuggestionsProps) {
  return (
    <div className="max-w-2xl mx-auto mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
        Try asking about...
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto p-3 text-left justify-start whitespace-normal rounded-xl border-border/50 hover:bg-muted/50 transition-colors"
            onClick={() => onSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
