/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { secureStorage } from "@/security/SecureStorage";
import {
  ProductMediaUpload,
  UploadedFile,
} from "@/components/ProductMediaUpload";
import { DocumentsUpload, UploadedDoc } from "@/components/DocumentsUpload";

interface CreateSheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
}

export function CreateSheetModal({
  isOpen,
  onOpenChange,
  categoryId,
}: CreateSheetModalProps) {
  const [fileId, setFileId] = useState("");
  const [imageFileId, setImageFileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [removeFileId, setRemoveFileId] = useState<any>();
  const [isUploading, setIsUploading] = useState(false);
  const [docFiles, setDocFiles] = useState<UploadedDoc[]>([]);
  const accessToken = secureStorage.get("accessToken");
  const uploadImage = (fileObj: UploadedFile) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", fileObj.file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${import.meta.env.VITE_API_URL}/file/image`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);

        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, progress: percent } : f,
          ),
        );
      }
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      const backendId = res?.response?.id;

      if (backendId) {
        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? { ...f, status: "complete", backendId, progress: 100 }
              : f,
          ),
        );

        setFileIds((prev) => [...prev, backendId]);
        setImageFileId(backendId);
      }

      setIsUploading(false);
    };

    xhr.onerror = () => {
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f)),
      );
      setIsUploading(false);
    };

    xhr.send(formData);
  };
  const removeFile = async (id: string) => {
    const file = mediaFiles.find((f) => f.id === id);

    if (file?.backendId) {
      setFileIds((prev) => prev.filter((fid) => fid !== file.backendId));
    }
    const accessToken = await secureStorage.getValidToken();
    //console.log("Removing file:", id);
    const url = `${import.meta.env.VITE_API_URL}/file?id=${id}`;
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    // Call API to delete file
    await fetch(url, options);
    setMediaFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("Image deleted successfully");
  };

  const uploadPdf = async (files: UploadedDoc[]) => {
    files.forEach(async (fileObj) => {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", fileObj.file);
      formData.append("language", fileObj.language);
      const accessToken = await secureStorage.getValidToken();
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${import.meta.env.VITE_API_URL}/file/excel`);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setDocFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id ? { ...f, progress: percent } : f,
            ),
          );
        }
      };

      xhr.onload = () => {
        let res;
        try {
          res = JSON.parse(xhr.responseText);
        } catch (e) {
          res = { message: "Unexpected server response" };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          const backendId = res?.response?.id;
          if (backendId) {
            setDocFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id
                  ? { ...f, status: "complete", progress: 100 }
                  : f,
              ),
            );
            setRemoveFileId(backendId);
            setFileIds((prev) => [...prev, backendId]);
            setFileId(backendId);
            // Success message from backend
            toast.success(res.message || "File uploaded successfully!");
          }
        } else {
          // Error message from backend (e.g., "File is required" or "Invalid format")
          handleUploadError(fileObj.id);
          toast.error(res.message || "Upload failed.");
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        handleUploadError(fileObj.id);
        setIsUploading(false);
        toast.error("Network error. Could not connect to server.");
      };

      xhr.send(formData);
    });
  };

  const handleSubmit = async () => {
    console.log("fileIds", fileIds);

    if (!fileIds) {
      toast.error("Please fill in all fields");
      return;
    }

    const body = {
      categoryId,
      fileId: fileId.trim(),
      imageFileId: imageFileId.trim(),
    };

    setLoading(true);
    const accessToken = await secureStorage.getValidToken();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/product/execl-genset-add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        toast.success("Sheet created successfully");
        onOpenChange(false);
        setFileId("");
        setImageFileId("");
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to create sheet");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleUploadError = (id: string) => {
    setDocFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "error" } : f)),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-max">
        <DialogHeader>
          <DialogTitle>Create New Sheet</DialogTitle>
          <p className="text-xs text-muted-foreground disabled">
            Category ID: {categoryId}
          </p>
        </DialogHeader>
        <div className="min-w-max grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProductMediaUpload
            files={mediaFiles}
            onFilesChange={setMediaFiles}
            onUpload={uploadImage}
            onRemove={removeFile}
          />

          <DocumentsUpload
            files={docFiles}
            onFilesChange={setDocFiles}
            onUpload={uploadPdf}
            fileRemoveId={removeFileId}
            newCategory={true}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#163859]"
          >
            {loading ? "Saving..." : "Save Sheet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
