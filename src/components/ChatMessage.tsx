
import { Message } from "@/contexts/ChatContext";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
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
      className={`p-4 mb-3 ${
        isUser
          ? "bg-primary/10 border border-primary/10"
          : "bg-muted/30 border border-muted/10"
      } rounded-2xl max-w-3xl mx-auto`}
    >
      <div className="flex items-center mb-2">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isUser ? "You" : "AI"}
        </div>
        <div className="ml-2 font-medium">
          {isUser ? "You" : message.model || "Assistant"}
        </div>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}
