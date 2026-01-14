/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { FileText, Upload, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { secureStorage } from "@/security/SecureStorage";

export interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
  type: string;
  file: File;
  language?: string;
}
const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Italian", value: "it" },
  { label: "French", value: "fr" },
];

interface DocumentsUploadProps {
  files: UploadedDoc[];
  onFilesChange: (files: UploadedDoc[]) => void;
  onUpload: (files: UploadedDoc[]) => void;
  fileRemoveId?: string;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext || "")) return "📝";
  if (["xls", "xlsx"].includes(ext || "")) return "📊";
  return "📎";
};

export function DocumentsUpload({
  files,
  onFilesChange,
  onUpload,
  fileRemoveId,
}: DocumentsUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptedTypes = ["application/pdf"];
  const handleLanguageChange = (id: string, lang: string) => {
    // 1. Update the local file object with the language
    const updatedFiles = files.map((f) =>
      f.id === id ? { ...f, language: lang, status: "uploading" as const } : f
    );
    onFilesChange(updatedFiles);

    // 2. Find the specific file that was just updated
    const fileToUpload = updatedFiles.find((f) => f.id === id);

    // 3. Trigger the upload ONLY now that language is present
    if (fileToUpload) {
      onUpload([fileToUpload]);
    }
  };
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
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const validFiles = newFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 2MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Map files to state but set status to "idle" (waiting for language)
    const newPendingFiles: UploadedDoc[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "idle" as any, // Change status to idle
      type: file.type,
      file,
    }));

    // ONLY update state, do NOT call onUpload yet
    onFilesChange([...files, ...newPendingFiles]);

    if (inputRef.current) inputRef.current.value = "";
  };
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const removeFile = async (id: string) => {
    const accessToken = await secureStorage.getValidToken();
    //console.log("Removing file:", id);
    const url = `${import.meta.env.VITE_API_URL}/file/${fileRemoveId}`;
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    // Call API to delete file
    await fetch(url, options);
    onFilesChange(files.filter((f) => f.id !== id));
    toast.success(`File Deleted Successfully`);
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
          <p className="text-sm text-muted-foreground mt-1">PDF(max. 2MB)</p>
        </div>

        {files.length > 0 && (
          <div className="mt-5 space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  {/* Icon & Name Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.status === "idle"
                        ? "Waiting for language..."
                        : file.status}
                    </p>
                  </div>

                  {/* LANGUAGE SELECT - Selection triggers the upload */}
                  <div className="flex items-center gap-2">
                    <select
                      disabled={file.status !== "idle"} // Disable once uploading starts
                      value={file.language || ""}
                      onChange={(e) =>
                        handleLanguageChange(file.id, e.target.value)
                      }
                      className={`text-xs border rounded px-2 py-1 outline-none ${
                        !file.language
                          ? "border-orange-400 bg-orange-50"
                          : "bg-background"
                      }`}
                    >
                      <option value="" disabled>
                        Select Language
                      </option>
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Show Progress only when uploading */}
                {file.status === "uploading" && (
                  <Progress value={file.progress} className="h-1 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
