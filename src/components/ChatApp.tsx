
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import Chat from "./Chat";

export default function ChatApp() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ChatProvider>
          <div className="flex min-h-screen w-full">
            <ChatSidebar />
            <div className="flex-1 flex flex-col">
              <Chat />
            </div>
          </div>
        </ChatProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
