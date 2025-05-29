import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { Menu, Settings } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useChat } from "@/contexts/ChatContext";
import SystemVariablesDialog from "./SystemVariablesDialog";
import DocumentViewer from "./DocumentViewer";
import { useChatActions } from "@/hooks/useChatActions";

export default function ChatHeader() {
  const { toggle } = useSidebar();
  const { currentChatId, chats } = useChat();
  const { systemPrompt, setSystemPrompt, handleSaveSystemPrompt } = useChatActions();
  
  // Find current chat title
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h1 className="text-lg font-medium">
          {currentChat?.title || "AI Chat Assistant"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <DocumentViewer />
        {currentChatId && (
          <SystemVariablesDialog
            systemPrompt={systemPrompt}
            onSave={(prompt) => {
              setSystemPrompt(prompt);
              handleSaveSystemPrompt();
            }}
            chatId={currentChatId}
          />
        )}
        <ThemeSelector />
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  );
}
