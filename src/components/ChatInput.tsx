import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, FileAudio, FileImage, File } from "lucide-react";
import { FormEvent, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FilePreview from "./FilePreview";
import VoiceInput from "./VoiceInput";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleVoiceTranscript = (transcript: string) => {
    setInput(prev => prev + (prev ? " " : "") + transcript);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check if any files are documents that should be processed for RAG
      const documentFiles = selectedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return ['.pdf', '.docx', '.txt', '.md'].includes(extension);
      });
      
      const mediaFiles = selectedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.mp4', '.mov'].includes(extension);
      });
      
      // Process document files for RAG
      if (documentFiles.length > 0) {
        setUploadingDocument(true);
        
        for (const file of documentFiles) {
          try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/upload-document', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            const { filename, chunk_count } = response.data;
            
            toast({
              title: "Document processed for AI context",
              description: `${filename} has been processed into ${chunk_count} chunks and will enhance AI responses.`,
            });

          } catch (error: any) {
            console.error('Document upload error:', error);
            toast({
              title: "Document processing failed",
              description: error.response?.data?.detail || `Failed to process ${file.name}`,
              variant: "destructive",
            });
          }
        }
        
        setUploadingDocument(false);
      }
      
      // Add media files to chat for analysis
      if (mediaFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...mediaFiles]);
        toast({
          title: "Files added for analysis",
          description: `${mediaFiles.length} file(s) ready to analyze and send`,
        });
      }
    }
    
    e.target.value = '';
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
      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {files.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              onRemove={() => setFiles(files.filter((_, i) => i !== index))}
              onView={() => {
                const url = URL.createObjectURL(file);
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            />
          ))}
        </div>
        {files.length > 0 && (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6" 
              onClick={() => setFiles([])}
            >
              Clear all files
            </Button>
          </div>
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
            className="resize-none pr-32 min-h-[50px] max-h-[200px] rounded-xl border border-foreground/20 shadow-sm bg-background"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || uploadingDocument}
            rows={1}
          />
          
          <div className="absolute right-2 bottom-1.5 flex gap-2">
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              disabled={disabled || uploadingDocument}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  disabled={disabled || uploadingDocument}
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
                <DropdownMenuItem onClick={() => triggerFileInput('.pdf,.docx,.txt,.md')}>
                  <File className="h-4 w-4 mr-2" />
                  <span>Document</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              size="icon"
              type="submit"
              disabled={input.trim() === '' && files.length === 0 || disabled || uploadingDocument}
              className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 transition-all"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="text-xs text-center mt-2 text-muted-foreground">
        {uploadingDocument ? "Processing document for AI context..." : "Press Enter to send • Upload images, audio, or documents • Use voice input"}
      </div>
    </form>
  );
}
