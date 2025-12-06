/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
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
const AddCategory = () => {
  const navigate = useNavigate();
  const accessToken = secureStorage.get("accessToken");
  const [categoryName, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  // Product state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productData, setProductData] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const userName = secureStorage.get("userInfo") || "";
  const formattedName = userName.charAt(0).toUpperCase();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
      toast.success("Image Uploaded Successfully");
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
    if (!categoryName || !description || fileIds.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      categoryName,
      description,
      fileIds: [fileIds],
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
          credentials: 'include',
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
        navigate("/login");
        return;
      }
      if (!res.ok) {
        toast.error("Failed to save category");
        return;
      }

      setCategory("");
      setDescription("");
      setFileIds([]);
      setUploadedFile(null);
      toast.success("Category saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div>
      <div className="space-y-6 p-4">
        <h1 className="text-left text-3xl">Add Your Categories</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Category Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background rounded-xl border border-border p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="category">Category Name</Label>
                  <Select value={categoryName} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diesel Generator">
                        Diesel Generator
                      </SelectItem>
                      <SelectItem value="Compressor">Compressor</SelectItem>
                      <SelectItem value="Forklift">Forklift</SelectItem>
                      <SelectItem value="Tower Light">Tower Light</SelectItem>
                      <SelectItem value="UPS">UPS</SelectItem>
                      <SelectItem value="Automatic Transfer Switch">
                        Automatic Transfer Switch
                      </SelectItem>
                      <SelectItem value="Distributor Panel">
                        Distributor Panel
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Category Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a detailed category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="space-y-6">
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              <Label>Category Image</Label>

              <input
                ref={inputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileSelect}
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
                    <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <Button onClick={handleSaveCategory}>Save Category</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
