import { useState, useCallback } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/components/ui/use-toast";
import { useSystemPrompt } from "@/hooks/useSystemPrompt";

export function useChatActions() {
  const { 
    currentChatId, 
    chats, 
    addMessage, 
    currentModel,
    isLoading,
    setIsLoading,
    updateSystemPrompt,
    getSystemPrompt,
    createChat
  } = useChat();
  
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const { isEditing: isEditingSystemPrompt, toggleEditMode: toggleSystemPromptEditor, saveSystemPrompt } = useSystemPrompt();
  const { toast } = useToast();
  
  // Get current chat
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  
  // Handle saving system prompt
  const handleSaveSystemPrompt = useCallback(async () => {
    if (currentChatId) {
      // First update locally
      updateSystemPrompt(currentChatId, systemPrompt);
      
      // Then update on the server
      try {
        await saveSystemPrompt(currentChatId, systemPrompt);
      } catch (error) {
        console.error("Error updating system prompt:", error);
        toast({
          title: "Error",
          description: "Failed to update system prompt",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [currentChatId, systemPrompt, updateSystemPrompt, saveSystemPrompt, toast]);
  
  // Enhanced handleSendMessage with file support and RAG integration
  const handleSendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!content.trim()) return;
    
    console.log('Sending message with files:', { 
      hasFiles: !!files?.length, 
      fileCount: files?.length || 0 
    });
    
    // If system prompt is being shown, this is a new chat
    const isNewChat = !currentChatId || (currentChat && currentChat.messages.length === 0);
    const systemPromptToUse = showSystemPrompt ? systemPrompt : undefined;
    
    // Add user message with file indication
    const userMessage = {
      role: "user" as const,
      content: content + (files && files.length > 0 ? ` [${files.length} file(s) attached]` : ''),
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
      // Enhanced API call with file support and RAG
      const apiResponse = await (window as any).apiService.sendMessage(
        currentChatId || "",
        content,
        currentModel,
        systemPromptToUse || currentChat?.systemPrompt,
        files // Pass files for RAG processing
      );
      
      console.log('Received API response:', {
        role: apiResponse.role,
        hasContent: !!apiResponse.content,
        hasCitations: !!apiResponse.citations?.length,
        conversationId: apiResponse.conversation_id
      });
      
      // Prepare AI response with citations if available
      const aiResponse = {
        role: apiResponse.role,
        content: apiResponse.content,
        model: currentModel,
        citations: apiResponse.citations, // Include citations from RAG
      };
      
      // Add AI response
      if (currentChatId) {
        // For existing chats
        addMessage(currentChatId, aiResponse);
      } else if (apiResponse.conversation_id) {
        // For new chats, we need to add both user message and AI response
        const newChatId = apiResponse.conversation_id;
        
        // The context will handle creating the chat
        addMessage(newChatId, userMessage);
        addMessage(newChatId, aiResponse);
        
        // Save the system prompt for this new chat
        if (systemPrompt) {
          updateSystemPrompt(newChatId, systemPrompt);
        }
      }

      // Show success toast if files were processed
      if (files && files.length > 0) {
        toast({
          title: "Files processed",
          description: `${files.length} file(s) have been analyzed and integrated into the response.`,
          duration: 5000,
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message if we have a current chat
      if (currentChatId) {
        addMessage(currentChatId, {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please check the console for details.",
          model: currentModel,
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to send message. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentChatId, 
    currentChat, 
    addMessage, 
    currentModel, 
    systemPrompt, 
    showSystemPrompt, 
    setIsLoading,
    updateSystemPrompt,
    toast
  ]);

  return {
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
  };
}
