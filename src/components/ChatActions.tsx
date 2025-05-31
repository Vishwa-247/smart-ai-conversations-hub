
import { Button } from "@/components/ui/button";
import { Copy, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatActionsProps {
  content: string;
  onRegenerate?: () => void;
  chatTitle?: string;
}

export default function ChatActions({ content, onRegenerate, chatTitle }: ChatActionsProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const exportAsTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatTitle || 'chat-export'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported successfully",
      description: "Chat has been saved as a text file.",
    });
  };

  const exportAsPdf = async () => {
    try {
      // Create a simple HTML structure for PDF
      const htmlContent = `
        <html>
          <head>
            <title>${chatTitle || 'Chat Export'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .content { white-space: pre-wrap; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${chatTitle || 'Chat Export'}</h1>
            <div class="content">${content}</div>
          </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chatTitle || 'chat-export'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exported successfully",
        description: "Chat has been saved as an HTML file (can be printed to PDF).",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export chat.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="ghost"
        onClick={copyToClipboard}
        className="h-7 w-7 p-0"
      >
        <Copy className="h-3 w-3" />
      </Button>
      
      {onRegenerate && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRegenerate}
          className="h-7 w-7 p-0"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportAsTxt}>
            Export as TXT
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsPdf}>
            Export as HTML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
