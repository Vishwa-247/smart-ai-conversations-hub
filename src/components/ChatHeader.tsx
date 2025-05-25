
import { Button } from "@/components/ui/button";
import { Settings, FileText, Plus } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import ModelSelector from "./ModelSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import SystemPromptEditor from "./SystemPromptEditor";
import DocumentUpload from "./DocumentUpload";

export default function ChatHeader() {
  const { createChat, currentModel, chats, currentChatId } = useChat();
  const [showSystemPromptEditor, setShowSystemPromptEditor] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  
  const currentChat = chats.find(c => c.id === currentChatId);

  const handleNewChat = () => {
    createChat(currentModel);
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          
          <ModelSelector />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowDocumentUpload(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Upload
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowSystemPromptEditor(true)}>
                Edit System Prompt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View Performance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showSystemPromptEditor && (
        <SystemPromptEditor 
          chatId={currentChatId}
          onClose={() => setShowSystemPromptEditor(false)}
        />
      )}

      {showDocumentUpload && (
        <DocumentUpload onClose={() => setShowDocumentUpload(false)} />
      )}
    </div>
  );
}
