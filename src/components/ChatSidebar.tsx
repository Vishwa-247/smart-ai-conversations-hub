
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
import { useIsMobile } from "@/hooks/use-mobile";

export default function ChatSidebar() {
  const { isOpen } = useSidebar();
  const {
    chats,
    currentChatId,
    createChat,
    selectChat,
    deleteChat,
    currentModel,
    setCurrentModel
  } = useChat();
  const sidebarRef = useSidebarAnimation(isOpen);
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (listRef.current && chats.length > 0) {
      const items = listRef.current.children;
      gsap.fromTo(items, {
        opacity: 0,
        x: -20
      }, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      });
    }
  }, [chats.length]);

  const handleCreateChat = async () => {
    console.log('Creating new chat with model:', currentModel);
    await createChat(currentModel);
  };

  const handleHomeClick = () => {
    window.location.reload();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      ref={sidebarRef} 
      className={`${
        isMobile 
          ? 'fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw]' 
          : 'w-64'
      } border-r h-screen flex flex-col bg-sidebar text-sidebar-foreground rounded-r-xl overflow-hidden border-sidebar-border/30`}
    >
      {/* Header Section */}
      <div className="flex-shrink-0">
        {/* Home Button - At top */}
        <div className="p-3 border-b border-sidebar-border/30">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleHomeClick} 
            className="w-full font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 rounded-xl py-3 justify-center text-sm"
          >
            🏠 Home
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-sidebar-border/30">
          <Button 
            onClick={handleCreateChat} 
            className="w-full flex items-center justify-center gap-2 animate-fade-in rounded-xl py-3 border border-sidebar-border/30 bg-sidebar-accent/10 hover:bg-foreground/5 transition-all duration-300 text-sm" 
            variant="outline"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="truncate">New Chat</span>
          </Button>
        </div>
        
        {/* Model Selector */}
        <div className="p-3 border-b border-sidebar-border/30">
          <h2 className="text-sm font-medium mb-2 truncate">Models</h2>
          <ModelSelector />
        </div>
      </div>
      
      {/* Chat History - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="p-3" ref={listRef}>
          <h2 className="text-sm font-medium mb-3 truncate">Chat History</h2>
          {chats.length === 0 && (
            <div className="text-xs text-sidebar-foreground/70 py-4 text-center px-2">
              No conversations yet
            </div>
          )}
          
          <div className="space-y-1">
            {chats.map(chat => (
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
      </div>
      
      {/* Footer with Theme Selector */}
      <div className="flex-shrink-0 p-3 border-t flex items-center justify-center bg-sidebar-accent/5 border-sidebar-border/30">
        <ThemeSelector />
      </div>
    </div>
  );
}
