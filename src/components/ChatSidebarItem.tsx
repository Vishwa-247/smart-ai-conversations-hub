
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

  // Get model icon class
  const getModelColorClass = (model: string) => {
    switch (model) {
      case "gpt-4o":
      case "gpt-4o-mini":
        return "bg-green-500";
      case "claude-3-sonnet":
        return "bg-purple-500";
      case "gemini-pro":
        return "bg-blue-500";
      case "grok-1":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-accent/10 ${
        isSelected ? "bg-accent/15" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${getModelColorClass(
          chat.model
        )}`}
      >
        <MessageSquare className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 truncate">
        <div className="font-medium">{chat.title}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
        </div>
      </div>
      <button
        onClick={handleDeleteClick}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="Delete chat"
      >
        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}
