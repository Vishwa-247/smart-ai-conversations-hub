
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/components/ui/use-toast";

interface SystemPromptEditorProps {
  chatId: string | null;
  onClose: () => void;
}

export default function SystemPromptEditor({ chatId, onClose }: SystemPromptEditorProps) {
  const { getSystemPrompt, updateSystemPrompt } = useChat();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (chatId) {
      const currentPrompt = getSystemPrompt(chatId);
      setPrompt(currentPrompt || "You are a helpful AI assistant.");
    }
  }, [chatId, getSystemPrompt]);

  const handleSave = async () => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      await updateSystemPrompt(chatId, prompt);
      toast({
        title: "System prompt updated",
        description: "Your custom instructions have been saved successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update system prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Edit System Prompt</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Define how the AI should behave and respond. This will apply to all messages in this chat.
          </div>
          
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are a helpful AI assistant..."
            className="min-h-[200px] resize-none"
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
