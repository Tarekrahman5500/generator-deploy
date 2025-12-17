import { useState, useRef } from "react";
import { FileText, Upload, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  type: string;
}

interface DocumentsUploadProps {
  files: UploadedDoc[];
  onFilesChange: (files: UploadedDoc[]) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext || "")) return "📝";
  if (["xls", "xlsx"].includes(ext || "")) return "📊";
  return "📎";
};

export function DocumentsUpload({ files, onFilesChange }: DocumentsUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => acceptedTypes.includes(file.type) || file.name.endsWith(".pdf")
    );
    handleFiles(droppedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedDoc[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      progress: 100,
      status: "complete" as const,
      type: file.type,
    }));
    onFilesChange([...files, ...uploadedFiles]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          Documents
          <Badge variant="secondary" className="ml-auto font-normal">
            PDF, DOC, XLS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
              }
            }}
          />
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-foreground">
            <span className="text-primary font-medium cursor-pointer hover:underline">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX, XLS, XLSX (max. 10MB)</p>
        </div>

        {files.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-medium text-foreground mb-3">
              Uploaded Documents ({files.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border animate-scale-in"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-lg">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.size} • {file.status === "complete" ? "Complete" : `${file.progress}%`}
                    </p>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1 mt-1.5" />
                    )}
                  </div>
                  {file.status === "complete" && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
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
