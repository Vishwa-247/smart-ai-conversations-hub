
import { useChat } from "@/contexts/ChatContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SystemPromptInput from "./SystemPromptInput";
import { useEffect, useRef, useState } from "react";
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
  
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current chat
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  
  // Show system prompt input when starting a new chat
  useEffect(() => {
    if (!currentChatId || (currentChat && currentChat.messages.length === 0)) {
      setShowSystemPrompt(true);
    } else {
      setShowSystemPrompt(false);
    }
  }, [currentChatId, currentChat]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);
  
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    // If system prompt is being shown, this is a new chat
    const systemPromptToUse = showSystemPrompt ? systemPrompt : undefined;
    
    // Add user message
    const userMessage: Omit<Message, "id" | "timestamp"> = {
      role: "user",
      content,
    };
    
    // If it's a new chat, we don't have a chat ID yet
    if (currentChatId) {
      addMessage(currentChatId, userMessage);
    }
    
    // Hide system prompt input after first message
    setShowSystemPrompt(false);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call API
      const response = await apiService.sendMessage(
        currentChatId || "",
        content,
        currentModel,
        systemPromptToUse
      );
      
      // Add AI response
      if (currentChatId) {
        // For existing chats
        addMessage(currentChatId, {
          role: response.role,
          content: response.content,
          model: currentModel,
        });
      } else if (response.conversation_id) {
        // For new chats, we need to add both user message and AI response
        const newChatId = response.conversation_id;
        
        // The context will handle creating the chat
        addMessage(newChatId, userMessage);
        addMessage(newChatId, {
          role: response.role,
          content: response.content,
          model: currentModel,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message if we have a current chat
      if (currentChatId) {
        addMessage(currentChatId, {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
          model: currentModel,
        });
      }
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
              Start a new conversation with any of our AI models.
            </p>
            {showSystemPrompt && (
              <div className="mb-6">
                <SystemPromptInput 
                  value={systemPrompt} 
                  onChange={setSystemPrompt} 
                />
              </div>
            )}
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showSystemPrompt && (
          <div className="max-w-3xl mx-auto p-4">
            <SystemPromptInput 
              value={systemPrompt} 
              onChange={setSystemPrompt}
            />
          </div>
        )}
        
        {currentChat && currentChat.messages.length > 0 ? (
          <div className="divide-y divide-border/10">
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
