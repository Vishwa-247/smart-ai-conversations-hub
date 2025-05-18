
import { useChat } from "@/contexts/ChatContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { useEffect, useRef } from "react";
import { apiService } from "@/services/api";
import { Message } from "@/contexts/ChatContext";

export default function Chat() {
  const { 
    currentChatId, 
    chats, 
    addMessage, 
    currentModel,
    isLoading,
    setIsLoading
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current chat
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);
  
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!currentChatId) return;
    
    // Add user message
    const userMessage: Omit<Message, "id" | "timestamp"> = {
      role: "user",
      content,
    };
    
    addMessage(currentChatId, userMessage);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call API
      const response = await apiService.sendMessage(
        currentChatId,
        content,
        currentModel
      );
      
      // Add AI response
      addMessage(currentChatId, {
        role: response.role,
        content: response.content,
        model: currentModel,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      addMessage(currentChatId, {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        model: currentModel,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChatId) {
    return (
      <div className="flex h-screen flex-col">
        <ChatHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md text-center p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Welcome to AI Chat</h2>
            <p className="text-muted-foreground mb-6">
              Select a chat from the sidebar or create a new one to start a conversation 
              with any of our AI models.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {currentChat && currentChat.messages.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            {currentChat.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastMessage={index === currentChat.messages.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center p-8 animate-fade-in">
              <div className="mb-6 text-6xl opacity-50 flex justify-center">
                💬
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Start a conversation
              </h2>
              <p className="text-muted-foreground">
                Send a message to begin chatting with {currentModel}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
