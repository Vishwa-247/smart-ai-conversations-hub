
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, FileAudio, FileImage, File } from "lucide-react";
import { FormEvent, useState, useRef } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || disabled) return;
    
    onSend(input, files.length > 0 ? files : undefined);
    setInput("");
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const renderSelectedFiles = () => {
    if (files.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center bg-muted/20 rounded-md px-2 py-1 text-xs"
          >
            {file.type.startsWith('image/') && <FileImage className="h-3 w-3 mr-1" />}
            {file.type.startsWith('audio/') && <FileAudio className="h-3 w-3 mr-1" />}
            {(!file.type.startsWith('image/') && !file.type.startsWith('audio/')) && <File className="h-3 w-3 mr-1" />}
            <span className="truncate max-w-[150px]">{file.name}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1" 
              onClick={() => setFiles(files.filter((_, i) => i !== index))}
            >
              ×
            </Button>
          </div>
        ))}
        {files.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-6" 
            onClick={() => setFiles([])}
          >
            Clear all
          </Button>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border/30">
      <div className="relative max-w-3xl mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        
        {renderSelectedFiles()}
        
        <div className="relative">
          <Textarea
            placeholder="Type your message here..."
            className="resize-none pr-24 min-h-[50px] max-h-[200px] rounded-xl border border-foreground/20 shadow-sm bg-background"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          
          <div className="absolute right-2 bottom-1.5 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  disabled={disabled}
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Add files</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => triggerFileInput('image/*')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  <span>Image</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => triggerFileInput('audio/*')}>
                  <FileAudio className="h-4 w-4 mr-2" />
                  <span>Audio</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => triggerFileInput('*')}>
                  <File className="h-4 w-4 mr-2" />
                  <span>Document</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              size="icon"
              type="submit"
              disabled={input.trim() === '' && files.length === 0 || disabled}
              className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 transition-all"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="text-xs text-center mt-2 text-muted-foreground">
        Press Enter to send
      </div>
    </form>
  );
}
