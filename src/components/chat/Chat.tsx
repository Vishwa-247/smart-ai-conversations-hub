
import { useEffect, useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import { useChatActions } from "@/hooks/useChatActions";
import ChatMessageList from "./ChatMessageList";
import EmptyChat from "./EmptyChat";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Chat() {
  const {
    currentChatId,
    currentChat,
    systemPrompt,
    setSystemPrompt,
    showSystemPrompt,
    setShowSystemPrompt,
    isEditingSystemPrompt,
    toggleSystemPromptEditor,
    handleSaveSystemPrompt,
    handleSendMessage,
    isLoading,
    getSystemPrompt
  } = useChatActions();
  
  const [isSystemPromptRequired, setIsSystemPromptRequired] = useState(false);
  const { toast } = useToast();
  
  // Show system prompt input when starting a new chat or when already in a chat with no messages
  useEffect(() => {
    if (!currentChatId || (currentChat && currentChat.messages.length === 0)) {
      setShowSystemPrompt(true);
      setIsSystemPromptRequired(false); // Allow empty system prompt
    } else {
      setIsSystemPromptRequired(false);
    }
    
    // Load system prompt if available
    if (currentChatId) {
      const prompt = getSystemPrompt(currentChatId);
      if (prompt !== undefined) {
        setSystemPrompt(prompt);
      } else {
        setSystemPrompt("");
      }
    }
  }, [currentChatId, currentChat, getSystemPrompt, setShowSystemPrompt, setSystemPrompt]);
  
  // Custom send handler to validate system prompt and use message as system prompt if needed
  const handleSendWithValidation = (content: string, files?: File[]) => {
    // For new chats with no system prompt, use the first message as the system prompt
    if ((!currentChatId || (currentChat && currentChat.messages.length === 0)) && !systemPrompt.trim()) {
      setSystemPrompt(content);
      handleSendMessage(content, files);
      return;
    }
    
    // Otherwise, just send the message normally
    handleSendMessage(content, files);
  };
  
  if (!currentChatId) {
    return (
      <EmptyChat
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        onSendMessage={handleSendWithValidation}
        isLoading={isLoading}
        showSystemPrompt={true} // Always show for new chats
        isRequired={false} // Allow using message as system prompt
      />
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChatMessageList
          messages={currentChat?.messages || []}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          isEditingSystemPrompt={isEditingSystemPrompt}
          toggleSystemPromptEditor={toggleSystemPromptEditor}
          handleSaveSystemPrompt={handleSaveSystemPrompt}
          showSystemPrompt={showSystemPrompt}
        />
      </div>
      
      <ChatInput onSend={handleSendWithValidation} disabled={isLoading} />
    </div>
  );
}
