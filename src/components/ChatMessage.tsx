
import { Message } from "@/contexts/ChatContext";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import gsap from "gsap";

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
}

export default function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
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

  return (
    <div
      ref={messageRef}
      className={`py-6 px-4 ${
        isUser ? "bg-transparent" : "bg-muted/10"
      } w-full`}
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
          <div className="font-medium text-sm mb-1">
            {isUser ? "You" : message.model || "Assistant"}
          </div>
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
