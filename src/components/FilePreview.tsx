
import { File, FileImage, FileAudio, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  onView?: () => void;
}

export default function FilePreview({ file, onRemove, onView }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');
  const isDocument = !isImage && !isAudio;

  return (
    <Card className="relative p-2 bg-muted/20 border border-border/30">
      <div className="flex items-center gap-2">
        {/* File Icon/Preview */}
        <div className="flex-shrink-0">
          {isImage ? (
            <div className="w-12 h-12 rounded border border-border/30 overflow-hidden bg-muted/50 flex items-center justify-center">
              <img 
                src={URL.createObjectURL(file)} 
                alt={file.name}
                className="w-full h-full object-cover"
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
              />
            </div>
          ) : isAudio ? (
            <div className="w-12 h-12 rounded border border-border/30 bg-muted/50 flex items-center justify-center">
              <FileAudio className="h-6 w-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded border border-border/30 bg-muted/50 flex items-center justify-center">
              <File className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onView}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Audio Preview */}
      {isAudio && (
        <div className="mt-2">
          <audio 
            controls 
            className="w-full h-8" 
            style={{ maxHeight: '32px' }}
            src={URL.createObjectURL(file)}
          />
        </div>
      )}
    </Card>
  );
}
