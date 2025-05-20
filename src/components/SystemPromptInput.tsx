
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SystemPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SystemPromptInput({ value, onChange }: SystemPromptInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="system-prompt">System Instructions (optional)</Label>
      <Textarea
        id="system-prompt"
        placeholder="Set custom instructions for the AI, e.g., 'You are a helpful coding assistant specialized in React...'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none"
      />
      <p className="text-xs text-muted-foreground">
        These instructions shape how the AI responds. Leave blank for default behavior.
      </p>
    </div>
  );
}
