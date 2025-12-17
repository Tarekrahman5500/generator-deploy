import { useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  type: "image" | "pdf";
  files: string[];
  maxFiles?: number;
  onFilesChange: (files: string[]) => void;
}

export function FileUpload({ type, files, maxFiles = 1, onFilesChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;

      const newFiles: string[] = [];
      const filesToProcess = Math.min(selectedFiles.length, maxFiles - files.length);
      let processed = 0;

      for (let i = 0; i < filesToProcess; i++) {
        const file = selectedFiles[i];
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            newFiles.push(reader.result as string);
            processed++;
            if (processed === filesToProcess) {
              onFilesChange([...files, ...newFiles]);
            }
          }
        };
        reader.readAsDataURL(file);
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [files, maxFiles, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const acceptTypes = type === "image" ? "image/*" : ".pdf";
  const Icon = type === "image" ? ImageIcon : FileText;
  const label = type === "image" ? "Image" : "PDF";

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Upload {label}{maxFiles > 1 ? `s (max ${maxFiles})` : ""}
      </Label>

      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        multiple={maxFiles > 1}
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${type}`}
      />

      {files.length < maxFiles && (
        <Card
          className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click to upload {label.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {type === "image" ? "PNG, JPG up to 10MB" : "PDF up to 10MB"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((file, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                {type === "image" ? (
                  <img
                    src={file}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-secondary/30">
                    <div className="text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
