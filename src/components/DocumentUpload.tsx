
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/apiClient";

interface DocumentUploadProps {
  onUploadSuccess?: (filename: string, chunkCount: number) => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
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
        description: `${filename} has been processed into ${chunk_count} chunks and is ready for queries.`,
      });

      if (onUploadSuccess) {
        onUploadSuccess(filename, chunk_count);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-500" />
        <h3 className="font-medium">Upload Documents</h3>
      </div>
      
      <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-4">
          Upload PDF, DOCX, TXT, or MD files to enhance AI responses
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
        </div>
      )}
    </div>
  );
}
