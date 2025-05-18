
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import ModelSelector from "./ModelSelector";
import ChatSidebarItem from "./ChatSidebarItem";
import ThemeSelector from "./ThemeSelector";
import { useSidebarAnimation } from "@/hooks/use-gsap-animations";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ChatSidebar() {
  const { isOpen } = useSidebar();
  const { chats, currentChatId, createChat, selectChat, deleteChat, currentModel } = useChat();
  const sidebarRef = useSidebarAnimation(isOpen);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current && chats.length > 0) {
      const items = listRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [chats.length]);

  const handleCreateChat = () => {
    createChat(currentModel);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className="w-64 border-r bg-sidebar h-screen flex flex-col"
    >
      <div className="p-4 border-b">
        <Button 
          onClick={handleCreateChat} 
          className="w-full flex items-center gap-2 animate-fade-in rounded-md hover:opacity-70 transition-opacity"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="p-4">
        <ModelSelector />
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4" ref={listRef}>
          <h2 className="text-xs font-semibold text-sidebar-foreground mb-2">Recent Chats</h2>
          {chats.length === 0 && (
            <div className="text-sm text-sidebar-foreground py-4 text-center">
              No conversations yet
            </div>
          )}
          
          {chats.map((chat) => (
            <ChatSidebarItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === currentChatId}
              onClick={() => selectChat(chat.id)}
              onDelete={() => deleteChat(chat.id)}
            />
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t flex items-center justify-between">
        <div className="text-sm font-medium text-sidebar-foreground">AI Chat App</div>
        <ThemeSelector />
      </div>
    </div>
  );
}
