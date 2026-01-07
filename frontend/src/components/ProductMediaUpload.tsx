import { useState, useRef } from "react";
import { ImageIcon, Upload, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface UploadedFile {
  id: string; // local UI id
  file: File;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  preview: string;
  backendId?: string; // 🔥 server file id
}

export interface ProductMediaUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onUpload: (file: UploadedFile) => void;
  onRemove: (id: string) => void;
}

export function ProductMediaUpload({
  files,
  onFilesChange,
  onUpload,
  onRemove,
}: ProductMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* ============ HELPERS ============ */

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* ============ FILE HANDLING ============ */

  const handleFiles = (newFiles: File[]) => {
    const preparedFiles: UploadedFile[] = newFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        status: "uploading",
        preview: URL.createObjectURL(file),
      }));

    if (preparedFiles.length === 0) return;

    onFilesChange([...files, ...preparedFiles]);

    // start upload for each file
    preparedFiles.forEach((file) => onUpload(file));
  };

  /* ============ DRAG EVENTS ============ */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  /* ================= RENDER ================= */

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-green-600" />
          </div>
          Product Media <span className="text-destructive">*</span>
          <Badge variant="secondary" className="ml-auto font-normal">
            Images only
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          aria-required="true"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
              }
            }}
          />

          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-primary" />
          </div>

          <p className="text-foreground">
            <span className="text-primary font-medium hover:underline">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG, WEBP (max 10MB)
          </p>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-medium mb-3">
              Uploaded Images ({files.length})
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                >
                  {/* Preview */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name.slice(0, 6)}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>

                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1 mt-1.5" />
                    )}

                    {file.status === "error" && (
                      <p className="text-xs text-red-500 mt-1">Upload failed</p>
                    )}
                  </div>

                  {/* Status */}
                  {file.status === "complete" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(file.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
