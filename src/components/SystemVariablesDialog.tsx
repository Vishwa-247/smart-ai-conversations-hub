
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SystemVariablesDialogProps {
  systemPrompt: string;
  onSave: (prompt: string) => void;
  chatId?: string;
}

export default function SystemVariablesDialog({ 
  systemPrompt, 
  onSave, 
  chatId 
}: SystemVariablesDialogProps) {
  const [open, setOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(systemPrompt);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(editedPrompt);
    setOpen(false);
    toast({
      title: "System variables updated",
      description: "Your system instructions have been saved.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">System Variables</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>System Variables & Instructions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              placeholder="Enter system instructions to customize AI behavior..."
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="min-h-[120px] mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              These instructions guide how the AI responds in this conversation.
            </p>
          </div>

          {chatId && (
            <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
              Chat ID: {chatId}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
