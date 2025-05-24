
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, MessageSquare } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import ModelSelector from "./ModelSelector";
import ChatSidebarItem from "./ChatSidebarItem";
import ThemeSelector from "./ThemeSelector";
import { useSidebarAnimation } from "@/hooks/use-gsap-animations";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ChatSidebar() {
  const { isOpen } = useSidebar();
  const { chats, currentChatId, createChat, selectChat, deleteChat, currentModel, setCurrentModel } = useChat();
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

  const handleGoHome = () => {
    window.location.reload();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className="w-64 border-r h-screen flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-semibold text-lg">AI Assistant</h1>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleGoHome}
            className="w-full justify-start gap-3 hover:bg-sidebar-accent"
            variant="ghost"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
          
          <Button 
            onClick={handleCreateChat} 
            className="w-full justify-start gap-3 hover:bg-sidebar-accent"
            variant="ghost"
          >
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>
      
      {/* Model Selector */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-medium mb-3 text-sidebar-foreground/70">Model</h2>
        <ModelSelector />
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4" ref={listRef}>
          <h2 className="text-sm font-medium mb-3 text-sidebar-foreground/70">Recent Chats</h2>
          {chats.length === 0 ? (
            <div className="text-sm text-sidebar-foreground/50 py-4 text-center">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1">
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
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="text-xs text-sidebar-foreground/50">© 2025 AI Assistant</div>
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}
