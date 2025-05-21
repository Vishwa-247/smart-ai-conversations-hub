
import { useEffect } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import { useChatActions } from "@/hooks/useChatActions";
import ChatMessageList from "./ChatMessageList";
import EmptyChat from "./EmptyChat";

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
  
  // Show system prompt input when starting a new chat
  useEffect(() => {
    if (!currentChatId || (currentChat && currentChat.messages.length === 0)) {
      setShowSystemPrompt(true);
    } else {
      setShowSystemPrompt(false);
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
  
  if (!currentChatId) {
    return (
      <EmptyChat
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        showSystemPrompt={showSystemPrompt}
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
      
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
