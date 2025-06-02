import { Message } from "@/contexts/ChatContext";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot, FileImage, FileAudio, File as FileIcon, RefreshCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ChatActions from "./ChatActions";
import gsap from "gsap";

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
  onRegenerate?: () => void;
  files?: File[];
}

export default function ChatMessage({ message, isLastMessage, onRegenerate, files }: ChatMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messageRef.current && isLastMessage) {
      gsap.fromTo(
        messageRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }
      );
    }
  }, [isLastMessage]);

  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) return null; // Don't display system messages

  const renderFileAttachments = () => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((file, index) => {
            const isImage = file.type.startsWith('image/');
            const isAudio = file.type.startsWith('audio/');
            
            if (isImage) {
              return (
                <div key={index} className="relative rounded-lg overflow-hidden border border-border/30 max-w-sm">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name}
                    className="w-full h-auto max-h-64 object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">{file.name}</p>
                  </div>
                </div>
              );
            }
            
            if (isAudio) {
              return (
                <div key={index} className="p-3 rounded-lg border border-border/30 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileAudio className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium truncate">{file.name}</p>
                  </div>
                  <audio 
                    controls 
                    className="w-full h-8" 
                    src={URL.createObjectURL(file)}
                  />
                </div>
              );
            }
            
            // Other file types
            return (
              <div key={index} className="p-3 rounded-lg border border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={messageRef}
      className={`group py-6 px-4 ${
        isUser ? "bg-transparent" : "bg-muted/10"
      } w-full hover:bg-muted/5 transition-colors`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Avatar className={`h-8 w-8 rounded-full ${isUser ? "bg-primary/90" : "bg-secondary"}`}>
            {isUser ? (
              <AvatarFallback className="text-primary-foreground">
                <User size={16} />
              </AvatarFallback>
            ) : (
              <AvatarFallback className="text-secondary-foreground">
                <Bot size={16} />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="font-medium text-sm">
              {isUser ? "You" : message.model || "Assistant"}
            </div>
            {!isUser && (
              <div className="flex items-center gap-2">
                {onRegenerate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                )}
                <ChatActions 
                  content={message.content}
                  onRegenerate={onRegenerate}
                  chatTitle="Chat Message"
                />
              </div>
            )}
          </div>
          
          {/* File attachments for user messages */}
          {isUser && renderFileAttachments()}
          
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
