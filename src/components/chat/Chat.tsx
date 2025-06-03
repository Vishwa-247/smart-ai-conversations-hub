
import { useEffect, useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import { useChatActions } from "@/hooks/useChatActions";
import ChatMessageList from "./ChatMessageList";
import EmptyChat from "./EmptyChat";
import { useChat } from "@/contexts/ChatContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Chat() {
  const { isInitialLoading, currentModel, updateMessage } = useChat();
  const [rewriteMessage, setRewriteMessage] = useState<string>("");
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
  
  // Enhanced send handler for system prompt workflow
  const handleSendWithSystemPrompt = (content: string, files?: File[]) => {
    handleSendMessage(content, files);
  };

  // Handle rewrite functionality
  const handleRewrite = (messageContent: string) => {
    setRewriteMessage(messageContent);
  };

  const handleRewriteComplete = () => {
    setRewriteMessage("");
  };

  // Handle regeneration - replace the last AI message instead of creating new one
  const handleRegenerate = (messageIndex: number) => {
    if (!currentChat || !currentChatId) return;
    
    // Find the user message that prompted this AI response
    const userMessage = currentChat.messages[messageIndex - 1];
    if (userMessage && userMessage.role === "user") {
      // Mark the AI message for replacement by setting a flag
      const aiMessage = currentChat.messages[messageIndex];
      if (aiMessage && aiMessage.role === "assistant") {
        // Update the AI message to show it's being regenerated
        updateMessage(currentChatId, messageIndex, {
          ...aiMessage,
          content: "🔄 Regenerating response...",
        });
        
        // Resend the user message to generate a new response
        handleSendMessage(userMessage.content);
      }
    }
  };
  
  // Show loading skeleton while initial data loads
  if (isInitialLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="border-t p-4">
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }
  
  if (!currentChatId) {
    return (
      <EmptyChat
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        onSendMessage={handleSendWithSystemPrompt}
        isLoading={isLoading}
        showSystemPrompt={true}
        isRequired={false}
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
          isLoading={isLoading}
          currentModel={currentModel}
          onRewrite={handleRewrite}
          onRegenerate={handleRegenerate}
        />
      </div>
      
      <ChatInput 
        onSend={handleSendWithSystemPrompt} 
        disabled={isLoading}
        rewriteMessage={rewriteMessage}
        onRewriteComplete={handleRewriteComplete}
      />
    </div>
  );
}
