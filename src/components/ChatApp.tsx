
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import Chat from "./Chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/contexts/SidebarContext";

function ChatAppContent() {
  const isMobile = useIsMobile();
  const { isOpen, close } = useSidebar();

  return (
    <div className="flex min-h-screen w-full relative overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}
      
      <ChatSidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile && isOpen ? 'overflow-hidden' : ''}`}>
        <div className="w-full h-full">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default function ChatApp() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ChatProvider>
          <div className="min-h-screen w-full">
            <ChatAppContent />
          </div>
        </ChatProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
