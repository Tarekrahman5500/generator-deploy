/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Settings,
  Package,
  Image as ImageIcon,
  Trash2,
  Plus,
  Upload,
  LogOut,
  List,
  Eye,
  Edit,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { NavLink, useNavigate } from "react-router-dom";
import { secureStorage } from "@/security/SecureStorage";
import { handleLogout } from "@/Util/LogOut";
import { Category, CategoryResponse } from "./Products";
const AddCategory = () => {
  const navigate = useNavigate();
  const accessToken = secureStorage.get("accessToken");
  const [categoryName, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [fileIds, setFileIds] = useState<string[]>([]);
  // Product state
  const userName = secureStorage.get("userInfo") || "";
  const formattedName = userName.charAt(0).toUpperCase();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    originalName?: string;
    url?: string;
    id?: string;
  }>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  // Auto Upload API Call
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/file/image`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      setFileIds(result?.response?.id);
      setFileInfo(result?.response);
      toast.success("Image Uploaded Successfully", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image MIME types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG & PNG files are allowed!");
      return;
    }

    setUploadedFile(file);
    uploadImage(file); // Upload automatically
  };
  const handleSaveCategory = async () => {
    if (!categoryName || !description) {
      toast.error("Please fill in all required fields", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }

    const payload = {
      categoryName,
      description,
      fileIds: [fileIds],
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        toast.error("Session expired. Please login again.", {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        handleLogout();
        navigate("/login");
        return;
      }
      if (!res.ok) {
        toast.error("Failed to save category", {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        return;
      }

      setCategory("");
      setDescription("");
      setFileIds([]);
      setUploadedFile(null);
      toast.success("Category saved successfully!", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/category/list`);
      const json = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categories: Category[] = json.categories.map((category: any) => ({
        id: category.id || "",
        categoryName: category.categoryName || "",
        description: category.description || "",
      }));

      setCategories({
        statusCode: res.status,
        categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories({
        statusCode: 500,
        categories: [],
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const removeFile = async (id: string) => {
    try {
      console.log("Removing file:", id);

      // Call API to delete file
      await fetch(`${import.meta.env.VITE_API_URL}/file/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // If you need authorization:
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Update local state
      setFileIds([]);
      setFileInfo({});
      toast.success("File deleted successfully", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
        },
      });
    } catch (error) {
      toast.error("Failed to delete file", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
        },
      });
      console.error("Failed to delete file:", error);
    }
  };
  return (
    <div>
      <div className="space-y-6 p-4">
        <h1 className="text-left text-3xl">Add Your Categories</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Category Details */}
          <div className="lg:col-span-2 space-y-6 h-80">
            <div className="bg-background rounded-xl border border-border p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="category">
                    Category Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={categoryName}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Category Description{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter a detailed category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="space-y-6 h-80">
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              <Label>
                Category Image <span className="text-destructive">*</span>
              </Label>

              <input
                ref={inputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileSelect}
                required
              />

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <p className="text-foreground font-medium">
                    Drag & drop your file here
                  </p>
                  <p className="text-sm text-muted-foreground">or</p>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                >
                  Browse files
                </Button>
              </div>

              {uploadedFile && (
                <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center">
                      <img
                        src={
                          fileInfo?.url
                            ? `${import.meta.env.VITE_API_URL}/${fileInfo.url}`
                            : ""
                        }
                        alt="File"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(fileInfo.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button onClick={handleSaveCategory} className="mt-5 ml-5 sm:mt-20">
        Save Category
      </Button>
    </div>
  );
};

export default AddCategory;
