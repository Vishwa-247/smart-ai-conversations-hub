
import { Chat } from "@/contexts/ChatContext";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash } from "lucide-react";
import { MouseEvent } from "react";

interface ChatSidebarItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function ChatSidebarItem({
  chat,
  isSelected,
  onClick,
  onDelete,
}: ChatSidebarItemProps) {
  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  // Get model icon based on the model type
  const getModelIcon = (model: string) => {
    switch (model) {
      case "phi3:mini":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
        );
      case "gemini-2.0-flash":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
          </svg>
        );
      case "groq-llama":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      default:
        return <MessageSquare className="h-4 w-4 text-white" />;
    }
  };

  // Get model color class
  const getModelColorClass = (model: string) => {
    switch (model) {
      case "phi3:mini":
        return "bg-green-500";
      case "gemini-2.0-flash":
        return "bg-blue-500";
      case "groq-llama":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:bg-foreground/10 cursor-pointer ${
        isSelected ? "bg-foreground/10" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${getModelColorClass(
          chat.model
        )}`}
      >
        {getModelIcon(chat.model)}
      </div>
      <div className="flex-1 truncate">
        <div className="font-medium">{chat.title}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
        </div>
      </div>
      <button
        onClick={handleDeleteClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Delete chat"
      >
        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}
