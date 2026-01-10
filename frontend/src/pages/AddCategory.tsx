/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
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

  const [categoryName, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [fileIds, setFileIds] = useState<string[]>([]);
  const [subCategoryNames, setSubCategoryNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      // Prevent duplicates
      if (!subCategoryNames.includes(inputValue.trim())) {
        setSubCategoryNames([...subCategoryNames, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setSubCategoryNames(
      subCategoryNames.filter((_, index) => index !== indexToRemove)
    );
  };
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
    const accessToken = await secureStorage.getValidToken();
    try {
      const url = `${import.meta.env.VITE_API_URL}/file/image`;
      const options = {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const res = await fetch(url, options);

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
      toast.error("Please fill in all required fields", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
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
    const accessToken = await secureStorage.getValidToken();
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
    const payload: any = {
      categoryName,
      description,
    };

    if (subCategoryNames && subCategoryNames.length > 0) {
      payload.subCategoryNames = subCategoryNames;
    }

    if (fileIds && fileIds.length > 0) {
      payload.fileIds = [fileIds];
    }

    try {
      const url = `${import.meta.env.VITE_API_URL}/category`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      };
      const res = await fetch(url, options);

      if (res.status === 401) {
        toast.error("Session expired. Please login again.", {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        await handleLogout();
        navigate("/login");
        return;
      }
      if (!res.ok) {
        toast.error(
          `${
            res.status === 409
              ? "Duplicate Entry.Category Already Exists"
              : "Something went wrong!"
          }`,
          {
            style: {
              background: "#ff0000", // your custom red
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
            },
          }
        );
        return;
      }

      setCategory("");
      setDescription("");
      setFileIds([]);
      setUploadedFile(null);
      setSubCategoryNames(null);
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
      toast.error(
        `${
          error?.errors[0]?.message ? error?.errors[0]?.message : error.message
        }`,
        {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        }
      );
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
        subCategoryNames,
      }));

      setCategories({
        statusCode: res.status,
        categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        `${
          error?.errors[0]?.message ? error?.errors[0]?.message : error.message
        }`,
        {
          style: {
            background: "#ff0000", //
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        }
      );
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
    const accessToken = await secureStorage.getValidToken();
    try {
      console.log("Removing file:", id);
      const url = `${import.meta.env.VITE_API_URL}/file/${id}`;
      const options = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // If you need authorization:
          Authorization: `Bearer ${accessToken}`,
        },
      };
      // Call API to delete file
      await fetch(url, options);

      // Update local state
      setFileIds(null);
      setFileInfo(null);
      toast.success("File deleted successfully", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
        },
      });
    } catch (error) {
      toast.error(
        `${
          error?.errors[0]?.message ? error?.errors[0]?.message : error.message
        }`,
        {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
          },
        }
      );
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
                <Label htmlFor="subcategories">
                  Sub Categories{" "}
                  <span className="text-destructive">(Optional)</span>
                </Label>

                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 ring-ring ring-offset-2">
                  {/* Render the Tags/Chips */}
                  {subCategoryNames.map((name, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 text-white bg-[#001f3f] rounded-full text-sm"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* The actual input field */}
                  <input
                    id="subcategories"
                    className="flex-1 bg-transparent outline-none min-w-[120px] text-sm py-1"
                    placeholder={
                      subCategoryNames.length === 0
                        ? "Type and press Enter..."
                        : ""
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to add a sub-category.
                </p>
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

              {uploadedFile && fileInfo && (
                <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center">
                      <img
                        src={
                          fileInfo?.url
                            ? `${import.meta.env.VITE_API_URL}/${fileInfo.url}`
                            : ""
                        }
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
      <Button
        onClick={handleSaveCategory}
        className="mt-28 ml-5 sm:mt-25 bg-[#163859] hover:bg-[#163859]"
      >
        Save Category
      </Button>
    </div>
  );
};

export default AddCategory;
