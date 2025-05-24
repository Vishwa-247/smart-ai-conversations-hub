
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

  // Get model color class - more professional colors
  const getModelColorClass = (model: string) => {
    switch (model) {
      case "gemini-pro":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "grok-1":
        return "bg-gradient-to-br from-purple-500 to-purple-600";
      case "mistral-7b":
        return "bg-gradient-to-br from-green-500 to-green-600";
      case "phi-3-mini":
        return "bg-gradient-to-br from-orange-500 to-orange-600";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600";
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-300 cursor-pointer hover:bg-sidebar-accent/10 ${
        isSelected ? "bg-sidebar-accent/15 border border-sidebar-border/30" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getModelColorClass(
          chat.model
        )} shadow-sm`}
      >
        <MessageSquare className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 truncate">
        <div className="font-medium text-sidebar-foreground truncate">{chat.title}</div>
        <div className="text-xs text-sidebar-foreground/60">
          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
        </div>
      </div>
      <button
        onClick={handleDeleteClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded hover:bg-destructive/20"
        aria-label="Delete chat"
      >
        <Trash className="h-4 w-4 text-sidebar-foreground/60 hover:text-destructive" />
      </button>
    </div>
  );
}
