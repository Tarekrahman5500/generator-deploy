/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { secureStorage } from "@/security/SecureStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Check, X, ImagePlus, Pencil } from "lucide-react";
import { Category, CategoryResponse } from "./Products";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageLoader from "@/components/Skeleton/ImageLoader";
import empty from "../assets/no-data-found.png";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UploadedFile } from "@/components/ProductMediaUpload";

const ViewCategory = () => {
  const accessToken = secureStorage.get("accessToken");
  const [categories, setCategories] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({
    categoryName: "",
    description: "",
    imageFile: null as File | null,
    imagePreview: "",
    subCategories: [],
    filesId: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
      const json = await res.json();

      const categories: Category[] = json.categories.map((category: any) => ({
        id: category.id || "",
        categoryName: category.categoryName || "",
        description: category.description || "",
        categoryFiles: (category.categoryFiles || []).map((fileObj: any) => ({
          id: fileObj.id || "",
          file: {
            id: fileObj.file.id,
            url: fileObj.file?.url || "",
          },
        })),
        subCategories: category.subCategories
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

  const handleEditClick = (category: Category) => {
    console.log(category)
    setEditingCategory(category);
    setEditForm({
      categoryName: category?.categoryName,
      description: category?.description || "",
      imageFile: null,
      imagePreview: category.categoryFiles[0]?.file?.url || "",
      subCategories: category?.subCategories || [],
      filesId: category?.categoryFiles[0]?.file?.id || "",
    });
    setIsEditModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1️⃣ Create preview immediately
      const previewUrl = URL.createObjectURL(file);

      // 2️⃣ Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      const url = `${import.meta.env.VITE_API_URL}/file/image`;
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
      // 3️⃣ Upload image
      const res = await fetch(url, options);

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();
      const fileId = result?.response?.id;

      // 4️⃣ Update form state with fileId
      setEditForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl,
        filesId: fileId, // ✅ THIS is what you wanted
      }));
      setFileIds(fileId);
      fetchCategories();
      toast.success("Image uploaded successfully", {
        style: {
          background: "#326e12",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image", {
        style: {
          background: "#ff0000",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;

    try {
      const url = `${import.meta.env.VITE_API_URL}/category`;
      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editingCategory.id,
          categoryName: editForm.categoryName,
          description: editForm.description,
          fileIds: [editForm.filesId],
        }),
      }
      // If you need to upload image, handle it here with FormData
      const res = await fetch(url, options);

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Category updated successfully");

      setCategories((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === editingCategory.id
            ? {
              ...cat,
              categoryName: editForm.categoryName,
              description: editForm.description,
            }
            : cat
        ),
      }));

      setIsEditModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      toast.error("Failed to update category");
      console.error(err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);

    try {

      const url = `${import.meta.env.VITE_API_URL
        }/category/soft-delete/${categoryId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to delete the category");
        throw new Error(`Error: ${response.status}`);
      }

      toast.success("Category deleted successfully");
      await fetchCategories();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete the category");
    } finally {
      setLoading(false);
    }
  };
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);

  const removeFile = async (id: string) => {
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
      }
      // Call API to delete file
      await fetch(url, options);

      // Update local state
      const file = mediaFiles.find((f) => f.id === id);
      if (file?.backendId) {
        setFileIds((prev) => prev.filter((fid) => fid !== file.backendId));
      }

      setMediaFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("Image deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error(`${error.message}`);
    }
  };
  // console.log(categories);
  const [editingId, setEditingId] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEditClickSub = (item: any) => {
    setEditingId(item.id);
    setTempValue(item.subCategoryName);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempValue("");
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const handleSave = async (id: string) => {
    // 1. Prevent empty submissions
    if (!tempValue.trim()) {
      toast.error("Sub-category name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      // 2. Get the authenticated token (will refresh if expired)
      const token = await secureStorage.getValidToken();
      if (!token) return; // refreshAccessToken handles the redirect to /login

      // 3. Call the API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sub-category/${id}`, {
        method: "PATCH", // Using PATCH for partial updates
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subCategoryName: tempValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update sub-category");
      }

      // 4. Update the local UI state (Optional: replace with a global fetch)
      // setItems(prev => prev.map(item => item.id === id ? { ...item, subCategoryName: tempValue } : item));
      fetchCategories();
      toast.success("Updated successfully!");
      setEditingId(null); // Close the edit mode
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Something went wrong while updating");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Categories</h1>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : categories.categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No categories found. Add your first category!
                  </TableCell>
                </TableRow>
              ) : (
                categories.categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {category.categoryFiles[0]?.file?.url ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${category?.categoryFiles[0]?.file?.url
                              }`}
                            alt={category.categoryName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.categoryName}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground mr-6"
                      title={category.description}>

                      {category.description || "-"}

                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate("/dashboard/add-product", {
                              state: { category },
                            })
                          }
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Product
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border">
                  <div className="relative w-full h-full rounded-lg overflow-hidden border">
                    {editForm.imagePreview ? (
                      <>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${editForm.imagePreview
                            }`}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFile(editForm.filesId)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImagePlus className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={editForm.categoryName}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    categoryName: e.target.value,
                  }))
                }
                placeholder="Enter category name"
              />
            </div>
            {editForm.subCategories.length > 0 ? <div className="space-y-4 w-full max-w-md">
              <Label>Sub Categories</Label>
              {editForm.subCategories.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    {editingId === item.id ? (
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="h-9"
                      />
                    ) : (
                      <div className="px-3 py-2 border border-solid rounded-md">
                        {item.subCategoryName}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {editingId === item.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave(item.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClickSub(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div> : ""}
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter category description"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewCategory;
