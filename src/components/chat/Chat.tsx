
import { useEffect, useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import { useChatActions } from "@/hooks/useChatActions";
import ChatMessageList from "./ChatMessageList";
import EmptyChat from "./EmptyChat";
import { useChat } from "@/contexts/ChatContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Chat() {
  const { isInitialLoading, currentModel } = useChat();
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
    // For new chats with no messages, first message can be system prompt
    if ((!currentChatId || (currentChat && currentChat.messages.length === 0)) && showSystemPrompt && !systemPrompt.trim()) {
      // If no system prompt is set and this is the first message, ask if they want to use it as system prompt
      setSystemPrompt(content);
    }
    
    handleSendMessage(content, files);
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
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Loading overlay only in chat area with model-specific message */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-background border rounded-lg p-6 shadow-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="text-left">
                <div className="text-sm font-medium">
                  {currentModel === 'phi3:mini' ? 'Ollama is generating response...' : 'AI is thinking...'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentModel === 'phi3:mini' 
                    ? 'Local Phi3 model is processing your request' 
                    : 'Please wait while we generate your response'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        
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
      
      <ChatInput onSend={handleSendWithSystemPrompt} disabled={isLoading} />
    </div>
  );
}
