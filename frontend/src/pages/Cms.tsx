/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import {
  ImageIcon,
  Upload,
  Loader2,
  Plus,
  X,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { secureStorage } from "@/security/SecureStorage";

interface ImageItem {
  section: string;
  title: string;
  description: string;
  fileId: string;
  previewUrl?: string;
  isUploading?: boolean;
}

export const ImageManagement = () => {
  const [items, setItems] = useState<ImageItem[]>([
    // Background Images
    {
      section: "Hero",
      title: "Hero Section Image",
      description: "",
      fileId: "",
    },
    {
      section: "Service Main",
      title: "Service Page Main",
      description: "",
      fileId: "",
    },
    {
      section: "About",
      title: "About Us Page Image",
      description: "",
      fileId: "",
    },

    // Static Contact Fields (Description will hold the actual value)
    { section: "Contact", title: "Email", description: "", fileId: "static" },
    { section: "Contact", title: "Phone", description: "", fileId: "static" },
    { section: "Contact", title: "Address", description: "", fileId: "static" },

    // Gallery Items
    {
      section: "Services",
      title: "Service Asset 1",
      description: "",
      fileId: "",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(
    null,
  );

  const uploadImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isUploading: true } : item,
      ),
    );

    try {
      const accessToken = await secureStorage.getValidToken();
      if (!accessToken) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/file/image`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const result = await res.json();
      const newFileId = result?.response?.id;

      if (newFileId) {
        setItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  fileId: newFileId,
                  previewUrl: URL.createObjectURL(file),
                  isUploading: false,
                }
              : item,
          ),
        );
        toast.success("Image Uploaded Successfully");
      }
    } catch (error) {
      toast.error("Upload failed");
      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, isUploading: false } : item,
        ),
      );
    }
  };

  const handleUpdateField = (
    index: number,
    field: keyof ImageItem,
    value: string,
  ) => {
    const next = [...items];
    (next[index] as any)[field] = value;
    setItems(next);
  };

  const handleSave = async () => {
    // Validation (Skipping fileId check for 'static' contact fields)
    // for (const item of items) {
    //     if (!item.description.trim()) {
    //         toast.error(`${item.title} is required.`);
    //         return;
    //     }
    //     if (item.section !== "Contact" && !item.fileId) {
    //         toast.error(`Image is required for ${item.section}`);
    //         return;
    //     }
    // }

    setIsSaving(true);
    try {
      const accessToken = await secureStorage.getValidToken();
      if (!accessToken) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/background/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ items }),
        },
      );
      const data = await res.json();

      if (res.ok) toast.success("All changes saved successfully!");
      else toast.error(`${data.message}`);
    } catch (error) {
      toast.error(`${error.message || "Failed to save changes"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 space-y-8 bg-background min-h-screen">
      <h1 className="text-4xl font-black tracking-tight text-foreground">
        Content Management
      </h1>

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeUploadIndex !== null)
            uploadImage(file, activeUploadIndex);
        }}
        accept="image/*"
      />

      {/* 1. Background Image Sections (Hero, Service Main, About) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => {
          if (["Hero", "Service Main", "About"].includes(item.section)) {
            return (
              <Card key={index} className="border-border">
                <CardHeader>
                  <Label className="font-bold text-lg">{item.section}</Label>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="aspect-video rounded-lg bg-muted border flex items-center justify-center bg-cover bg-center"
                    style={{
                      backgroundImage: item.previewUrl
                        ? `url(${item.previewUrl})`
                        : "none",
                    }}
                  >
                    {!item.previewUrl && (
                      <ImageIcon className="opacity-20" size={40} />
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => {
                      setActiveUploadIndex(index);
                      fileInputRef.current?.click();
                    }}
                  >
                    {item.isUploading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Change Background
                  </Button>
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) =>
                      handleUpdateField(index, "title", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdateField(index, "description", e.target.value)
                    }
                  />
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </div>

      {/* 2. STATIC CONTACT SECTION */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, index) => {
              if (item.section === "Contact") {
                const Icon =
                  item.title === "Email"
                    ? Mail
                    : item.title === "Phone"
                      ? Phone
                      : MapPin;
                return (
                  <div
                    key={index}
                    className="space-y-2 p-4 rounded-xl border bg-muted/20"
                  >
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Icon size={18} />
                      <span className="font-bold uppercase text-xs tracking-wider">
                        {item.title}
                      </span>
                    </div>
                    <Input
                      placeholder={`Enter ${item.title.toLowerCase()}...`}
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateField(index, "description", e.target.value)
                      }
                      className="bg-background"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Services Gallery Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">
            Services Page Images Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, index) => {
            if (item.section !== "Services") return null;
            return (
              <div
                key={index}
                className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-muted/30 relative group"
              >
                <div
                  className="aspect-video rounded-lg border bg-muted bg-cover bg-center relative overflow-hidden"
                  style={{
                    backgroundImage: item.previewUrl
                      ? `url(${item.previewUrl})`
                      : "none",
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setActiveUploadIndex(index);
                        fileInputRef.current?.click();
                      }}
                    >
                      {item.isUploading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Upload"
                      )}
                    </Button>
                  </div>
                </div>
                <Input
                  className="h-8 text-sm"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) =>
                    handleUpdateField(index, "title", e.target.value)
                  }
                />
                <Textarea
                  className="text-sm min-h-[60px]"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateField(index, "description", e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive self-end"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                >
                  <X size={14} />
                </Button>
              </div>
            );
          })}
          <button
            onClick={() =>
              setItems([
                ...items,
                { section: "Services", title: "", description: "", fileId: "" },
              ])
            }
            className="aspect-auto min-h-[200px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all text-muted-foreground"
          >
            <Plus size={32} />
            <span className="text-sm font-semibold">Add Service Asset</span>
          </button>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" className="px-10">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 bg-primary text-white hover:bg-primary/90"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
};
