
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, CheckCircle, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/apiClient";

interface DocumentUploadProps {
  onClose: () => void;
  onUploadSuccess?: (filename: string, chunkCount: number) => void;
}

export default function DocumentUpload({ onClose, onUploadSuccess }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload PDF, DOCX, TXT, or MD files only.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      console.log(`📁 Uploading document: ${file.name}`);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { filename, chunk_count } = response.data;
      
      setUploadedFiles(prev => [...prev, filename]);
      
      toast({
        title: "Document uploaded successfully",
        description: `${filename} has been processed into ${chunk_count} chunks and is ready for enhanced responses.`,
      });

      if (onUploadSuccess) {
        onUploadSuccess(filename, chunk_count);
      }

      console.log(`✅ Document uploaded successfully: ${filename}`);

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.detail || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Upload Documents
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload PDF, DOCX, TXT, or MD files to enhance AI responses with document context
            </p>
            
            <Input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="document-upload"
            />
            
            <Button
              onClick={() => document.getElementById('document-upload')?.click()}
              disabled={uploading}
              variant="outline"
              className="w-full"
            >
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded Documents:</p>
              {uploadedFiles.map((filename, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{filename}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                These documents will now be used to enhance AI responses with relevant context.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
