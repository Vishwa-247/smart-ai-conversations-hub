
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, CheckCircle, AlertCircle, File, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/apiClient";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentUploadProps {
  onUploadSuccess?: (filename: string, chunkCount: number) => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
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
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { filename, chunk_count } = response.data;
      
      setUploadProgress(100);
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
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await handleFile(file);
    event.target.value = '';
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <File className="h-4 w-4 text-blue-500" />;
      case 'txt':
      case 'md':
        return <File className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <FileText className="h-5 w-5 text-blue-500" />
        </motion.div>
        <h3 className="font-medium">Upload Documents</h3>
      </div>
      
      <motion.div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border/50 hover:border-primary/50'
        } backdrop-blur-sm`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="h-8 w-8 mx-auto text-primary" />
              </motion.div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading...</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div 
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports PDF, DOCX, TXT, and MD files (max 10MB)
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
                  className="bg-primary/10 hover:bg-primary/20 border-primary/30"
                >
                  Choose Files
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Uploaded Documents:
            </p>
            {uploadedFiles.map((filename, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {getFileIcon(filename)}
                <span className="text-sm font-medium text-green-700 dark:text-green-300 flex-1">
                  {filename}
                </span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
