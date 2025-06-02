
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Send, Eye } from "lucide-react";
import { ScrapedContent, ScrapingStorageService } from "@/services/scrapingStorageService";

interface ScrapingPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendToAI: (content: string) => void;
}

export default function ScrapingPreview({ open, onOpenChange, onSendToAI }: ScrapingPreviewProps) {
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>(
    ScrapingStorageService.getAllScrapedContent()
  );
  const [selectedContent, setSelectedContent] = useState<ScrapedContent | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const refreshContent = () => {
    setScrapedContent(ScrapingStorageService.getAllScrapedContent());
  };

  const handleDelete = (id: string) => {
    ScrapingStorageService.deleteScrapedContent(id);
    refreshContent();
  };

  const handleSendToAI = (content: ScrapedContent) => {
    const prompt = `Please analyze and summarize the following content from: ${content.url}

Title: ${content.title}

Content:
${content.content}

Please provide a comprehensive summary highlighting the key points and main topics.`;
    
    onSendToAI(prompt);
    onOpenChange(false);
  };

  const handlePreview = (content: ScrapedContent) => {
    setSelectedContent(content);
    setPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Scraped Content Library</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {scrapedContent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scraped content available. Scrape some URLs first!
                </div>
              ) : (
                scrapedContent.map((content) => (
                  <Card key={content.id} className="w-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-sm font-medium line-clamp-1">
                            {content.title}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground">
                            {content.url}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(content.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreview(content)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendToAI(content)}
                            className="h-8 w-8 p-0"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(content.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {content.content.substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Content Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="line-clamp-1">{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                URL: {selectedContent?.url}
              </div>
              <div className="prose dark:prose-invert prose-sm max-w-none">
                {selectedContent?.content}
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedContent) {
                  handleSendToAI(selectedContent);
                  setPreviewOpen(false);
                }
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Send to AI
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
