
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2 } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { useChat } from "@/contexts/ChatContext";

interface Document {
  filename: string;
  chunk_count: number;
  upload_time: string;
  id: string;
}

export default function DocumentViewer() {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentChatId } = useChat();

  const fetchDocuments = async () => {
    if (!currentChatId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/documents?chat_id=${currentChatId}`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && currentChatId) {
      fetchDocuments();
    }
  }, [open, currentChatId]);

  const deleteDocument = async (filename: string) => {
    try {
      await apiClient.delete(`/documents/${encodeURIComponent(filename)}?chat_id=${currentChatId}`);
      await fetchDocuments();
      toast({
        title: "Document deleted",
        description: `${filename} has been removed from this chat's knowledge base.`,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  if (!currentChatId) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
            <span className="sr-only">View Documents</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Knowledge Base Documents</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            Please select a chat to view its documents.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileText className="h-4 w-4" />
          <span className="sr-only">View Documents</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chat Knowledge Base</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No documents uploaded to this chat yet. Upload documents through the chat to enhance AI responses.
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.chunk_count} chunks • {new Date(doc.upload_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDocument(doc.filename)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
