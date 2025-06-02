import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, FileAudio, FileImage, File, Link } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";
import { FileProcessor } from "@/services/fileProcessor";
import { UrlContentService } from "@/services/urlContentService";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FilePreview from "./FilePreview";
import VoiceInput from "./VoiceInput";

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
  rewriteMessage?: string;
  onRewriteComplete?: () => void;
}

export default function ChatInput({ onSend, disabled = false, rewriteMessage, onRewriteComplete }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Handle rewrite message
  useEffect(() => {
    if (rewriteMessage) {
      setIsRewriting(true);
      setInput(`Please rewrite the following response to make it better, more accurate, or more helpful:\n\n"${rewriteMessage}"\n\nRewritten version:`);
      // Focus textarea after setting the message
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      }, 100);
    }
  }, [rewriteMessage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || disabled) return;
    
    let messageContent = input;
    
    // Process files to extract text content
    if (files.length > 0) {
      setProcessingFiles(true);
      try {
        const processedContents = await Promise.all(
          files.map(async (file) => {
            try {
              const result = await FileProcessor.processFile(file);
              return `\n\n[${result.type.toUpperCase()}: ${file.name}]\n${result.content}`;
            } catch (error) {
              console.error(`Error processing ${file.name}:`, error);
              return `\n\n[${file.name}: Processing failed]`;
            }
          })
        );
        
        messageContent = input + processedContents.join('');
      } catch (error) {
        toast({
          title: "File processing error",
          description: "Some files could not be processed",
          variant: "destructive",
        });
      } finally {
        setProcessingFiles(false);
      }
    }
    
    // Send the message with processed content
    onSend(messageContent, files.length > 0 ? files : undefined);
    setInput("");
    setFiles([]);
    
    // Handle rewrite completion
    if (isRewriting) {
      setIsRewriting(false);
      onRewriteComplete?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter: Allow new line (default behavior)
        return;
      } else {
        // Enter: Submit the form
        e.preventDefault();
        handleSubmit(e);
      }
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
          title: "Files ready for processing",
          description: `${mediaFiles.length} file(s) will be processed when sent`,
        });
      }
    }
    
    e.target.value = '';
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput.trim()) return;
    
    setScrapingUrl(true);
    try {
      const content = await UrlContentService.fetchAndSummarize(urlInput);
      setInput(prev => prev ? `${prev}\n\n${content}` : content);
      
      toast({
        title: "URL content fetched",
        description: "Content has been added for analysis. Send the message to get a summary.",
      });
      
      setShowUrlDialog(false);
      setUrlInput("");
    } catch (error: any) {
      console.error('URL analysis error:', error);
      toast({
        title: "URL analysis failed",
        description: error.message || "Failed to fetch URL content",
        variant: "destructive",
      });
    } finally {
      setScrapingUrl(false);
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
    <>
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
              ref={textareaRef}
              placeholder={isRewriting ? "Edit the rewrite request above..." : "Type your message here... (Enter to send, Shift+Enter for new line)"}
              className="resize-none pr-40 min-h-[50px] max-h-[200px] rounded-xl border border-foreground/20 shadow-sm bg-background"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || uploadingDocument || processingFiles}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-1.5 flex gap-2">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                disabled={disabled || uploadingDocument || processingFiles}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    disabled={disabled || uploadingDocument || processingFiles}
                  >
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">Add files</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => triggerFileInput('image/*')}>
                    <FileImage className="h-4 w-4 mr-2" />
                    <span>Image (OCR)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => triggerFileInput('audio/*')}>
                    <FileAudio className="h-4 w-4 mr-2" />
                    <span>Audio</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => triggerFileInput('.pdf,.docx,.txt,.md')}>
                    <File className="h-4 w-4 mr-2" />
                    <span>Document</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowUrlDialog(true)}>
                    <Link className="h-4 w-4 mr-2" />
                    <span>Analyze URL</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                size="icon"
                type="submit"
                disabled={input.trim() === '' && files.length === 0 || disabled || uploadingDocument || processingFiles}
                className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 transition-all"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="text-xs text-center mt-2 text-muted-foreground">
          {isRewriting ? "Rewriting mode - Edit the prompt above and send" : 
           processingFiles ? "Processing files..." : 
           uploadingDocument ? "Processing document for AI context..." : 
           "Press Enter to send • Shift+Enter for new line • Upload images (OCR), audio, or documents • Use voice input • Analyze URLs"}
        </div>
      </form>

      {/* URL Analysis Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analyze URL Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter URL to analyze and summarize..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={scrapingUrl}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleUrlAnalysis} 
                disabled={!urlInput.trim() || scrapingUrl}
                className="flex-1"
              >
                {scrapingUrl ? "Analyzing..." : "Analyze Content"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowUrlDialog(false)}
                disabled={scrapingUrl}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
