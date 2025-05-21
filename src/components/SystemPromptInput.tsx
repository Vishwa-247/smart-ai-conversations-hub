
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface SystemPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  isEditing?: boolean;
  toggleEdit?: () => void;
  readOnly?: boolean;
}

export default function SystemPromptInput({ 
  value, 
  onChange, 
  onSave, 
  isEditing = false, 
  toggleEdit,
  readOnly = false 
}: SystemPromptInputProps) {
  const [tempValue, setTempValue] = useState(value);
  const { toast } = useToast();

  // Update tempValue whenever value changes from outside
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    if (onSave) {
      onSave();
      toast({
        title: "System prompt updated",
        description: "Your custom instructions have been saved",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-border/50 p-4 bg-muted/10">
      <div className="flex justify-between items-center">
        <Label htmlFor="system-prompt" className="text-sm font-medium">
          {readOnly ? "System Instructions" : "System Instructions (optional)"}
        </Label>
        {toggleEdit && (
          <Button 
            onClick={toggleEdit} 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Edit system prompt</span>
          </Button>
        )}
      </div>
      
      <Textarea
        id="system-prompt"
        placeholder="Set custom instructions for the AI, e.g., 'You are a helpful coding assistant specialized in React...'"
        value={isEditing ? tempValue : value}
        onChange={(e) => setTempValue(e.target.value)}
        className="min-h-[100px] resize-none rounded-lg"
        readOnly={readOnly && !isEditing}
      />
      
      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button 
            onClick={toggleEdit} 
            variant="outline" 
            size="sm"
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            size="sm"
            className="rounded-lg"
          >
            Save Changes
          </Button>
        </div>
      )}
      
      {!isEditing && !readOnly && (
        <p className="text-xs text-muted-foreground">
          These instructions shape how the AI responds. Leave blank for default behavior.
        </p>
      )}
    </div>
  );
}
