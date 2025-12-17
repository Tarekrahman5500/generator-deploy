/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { secureStorage } from "@/security/SecureStorage";
import ProductTableSkeleton from "./Skeleton/AdminProductSkeleton";
import { ProductMediaUpload, UploadedFile } from "./ProductMediaUpload";

interface ProductFile {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

interface GroupField {
  fieldName: string;
  value: string;
  fieldId: string;
  valueId: string;
}

interface Product {
  id: string;
  modelName: string;
  description: string;
  category: {
    id: string;
    categoryName: string;
    description: string;
  };
  group: Record<string, GroupField[]>;
  files: ProductFile[];
}

interface ProductTableProps {
  loading: boolean;
  products: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

const ProductTable = ({
  loading,
  products,
  meta,
  onPageChange,
}: ProductTableProps) => {
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [editedProductName, setEditedProductName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [editedGroups, setEditedGroups] = useState<
    Record<string, GroupField[]>
  >({});

  const handleView = (product: Product) => {
    setViewProduct(product);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditedGroups({ ...product.group });
    setEditedProductName(product.modelName);
    setEditedDescription(product.description);
  };

  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
  };
  const [missingFields, setMissingFields] = useState<{ [key: string]: any }>(
    {}
  );

  // const handleAddField = (groupName: string) => {
  //   setEditedGroups((prev) => ({
  //     ...prev,
  //     General: [
  //       ...(prev.General || []),
  //       { fieldId: crypto.randomUUID(), fieldName: "", value: "" },
  //     ],
  //   }));
  // };

  const handleAddField = async (productId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/product/missing-field/${productId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch missing fields");
      }

      const result = await response.json();

      // Assuming API returns { data: { missingFields: [] } }
      setMissingFields(result.missingFields || []);
    } catch (error) {
      console.error("Error fetching missing fields:", error);
    }
  };

  const [matchedId, setMatchedId] = useState("");
  const handleRemoveField = async (
    groupName: string,
    index: number,
    fields: any
  ) => {
    setEditedGroups((prev) => ({
      ...prev,
      [groupName]: prev[groupName].filter((_, i) => i !== index),
    }));
    const matchedField = fields[index]; // get the field at the given index
    if (matchedField) {
      setMatchedId(matchedField.valueId);
    } else {
      setMatchedId(null); // optional fallback
    }
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/product/delete-field-value/${matchedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${secureStorage.get("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete field value:", errorData);
        toast.error("Failed to delete field");
        return;
      }

      toast.success("Field value deleted successfully");
      // Optionally refresh your state after deletion
    } catch (err) {
      console.error("Error deleting field value:", err);
    }
  };

  const handleFieldChange = (
    groupName: string,
    index: number,
    field: "fieldName" | "value",
    newValue: string
  ) => {
    setEditedGroups((prev) => ({
      ...prev,
      [groupName]: prev[groupName].map((item, i) =>
        i === index ? { ...item, [field]: newValue } : item
      ),
    }));
  };

  const handleSaveEdit = async () => {
    //  console.log(editedGroups);
    if (!editProduct) return;
    const information = Object.values(editedGroups).flat();
    const updatedProduct = {
      id: editProduct.id,
      modelName: editedProductName,
      description: editedDescription,
      information: information,
      fileIds,
    };
    // console.log(updatedProduct);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/product`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secureStorage.get("accessToken")}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully", {
        style: {
          background: "#326e12",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });

      // close modal after success
      setEditProduct(null);
    } catch (error) {
      toast.error("Failed to update product", {
        style: {
          background: "#ff0000",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    //  console.log("Deleting product:", deleteProduct);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/product/soft-delete/${
          deleteProduct?.id
        }`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${secureStorage.get("accessToken")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });

      // close delete modal / reset state
      setDeleteProduct(null);
    } catch (error) {
      toast.error("Failed to delete product", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      console.error(error);
    }
  };

  const startIndex = (meta.page - 1) * meta.limit + 1;
  const endIndex = Math.min(meta.page * meta.limit, meta.total);
  const getImageUrl = (path?: string) =>
    path ? `${import.meta.env.VITE_API_URL}/${path}` : "/placeholder.png";
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const removeFile = async (id: string) => {
    try {
      console.log("Removing file:", id);

      // Call API to delete file
      await fetch(`${import.meta.env.VITE_API_URL}/file/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // If you need authorization:
          // "Authorization": `Bearer ${accessToken}`,
        },
      });

      // Update local state
      const file = mediaFiles.find((f) => f.id === id);
      if (file?.backendId) {
        setFileIds((prev) => prev.filter((fid) => fid !== file.backendId));
      }

      setMediaFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const uploadImage = (fileObj: UploadedFile) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", fileObj.file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${import.meta.env.VITE_API_URL}/file/image`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);

        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, progress: percent } : f
          )
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
              : f
          )
        );

        setFileIds((prev) => [...prev, backendId]);
      }

      setIsUploading(false);
    };

    xhr.onerror = () => {
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f))
      );
      setIsUploading(false);
    };

    xhr.send(formData);
  };
  return (
    <div className="space-y-4">
      {loading ? (
        <ProductTableSkeleton />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">
                  PRODUCT NAME
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Description
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  CATEGORY
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.files?.[0] && (
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={getImageUrl(product.files?.[0]?.url)}
                            alt={product.modelName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                      <span className="font-medium text-foreground">
                        {product.modelName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell
                    className="max-w-[300px] truncate text-muted-foreground mr-6"
                    title={product.description}
                  >
                    {product.description}
                  </TableCell>

                  <TableCell className="mr-4">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      {product.category.categoryName}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleView(product)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* /* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIndex}-{endIndex}
            </span>{" "}
            of <span className="font-medium text-foreground">{meta.total}</span>{" "}
            products
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={meta.page <= 1}
              onClick={() => onPageChange?.(meta.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .slice(0, 3)
              .map((page) => (
                <Button
                  key={page}
                  variant={page === meta.page ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onPageChange?.(page)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange?.(meta.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* View Modal */}
      <Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {viewProduct?.modelName}
            </DialogTitle>
            <DialogDescription>
              {viewProduct?.category.categoryName}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-foreground mt-1">
                  {viewProduct?.description}
                </p>
              </div>

              {viewProduct?.group &&
                Object.entries(viewProduct.group).map(([groupName, fields]) => (
                  <div key={groupName} className="space-y-2">
                    <Label className="text-primary font-semibold">
                      {groupName}
                    </Label>
                    <div className="grid gap-2 pl-3 border-l-2 border-primary/30">
                      {fields.map((field, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {field.fieldName}
                          </span>
                          <span className="text-foreground">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {viewProduct?.files && viewProduct.files.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Files</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {viewProduct.files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-lg bg-muted overflow-hidden h-24 w-full flex items-center justify-center"
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${file.url}`}
                          alt={file.originalName}
                          className="object-cover h-full w-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      {/* Edit Modal */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-3xl bg-card border-border p-4">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Product</DialogTitle>
            <DialogDescription>
              Update product details and group fields
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4 p-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editedProductName}
                  onChange={(e) => setEditedProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Accordion
                type="multiple"
                className="w-full"
                defaultValue={Object.keys(editedGroups)}
              >
                {Object.entries(editedGroups).map(([groupName, fields]) => (
                  <AccordionItem
                    key={groupName}
                    value={groupName}
                    className="border-border"
                  >
                    <AccordionTrigger className="text-foreground hover:no-underline ">
                      <div className="flex items-center gap-2 ">
                        <span>{groupName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {fields.length} fields
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2 p-2">
                        {fields.map((field, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Field name"
                                value={field.fieldName}
                                disabled={true}
                                onChange={(e) =>
                                  handleFieldChange(
                                    groupName,
                                    index,
                                    "fieldName",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                placeholder="Value"
                                value={field.value}
                                onChange={(e) =>
                                  handleFieldChange(
                                    groupName,
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() =>
                                handleRemoveField(groupName, index, fields)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed"
                          onClick={() => handleAddField(editProduct.id)}
                          disabled={loading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {loading ? "Loading..." : `Add Field to ${groupName}`}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}

                {missingFields.category?.groups?.map((group: any) => (
                  <AccordionItem
                    key={group.id}
                    value={group.groupName}
                    className="border-border"
                  >
                    <h1>Missing Fields For Existing Group(Optional)</h1>
                    <AccordionTrigger className="text-foreground hover:no-underline flex justify-between items-center">
                      <span>{group.groupName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {group.fields.length} fields
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2 p-2 max-h-96 overflow-y-auto">
                        {group.fields.map((field: any, index: number) => (
                          <div
                            key={field.id}
                            className="flex items-start gap-2"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Field name"
                                value={field.fieldName}
                                disabled
                                className="w-full"
                              />
                              <Input
                                placeholder="Value"
                                value={field.value || ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    group.id,
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() =>
                                handleRemoveField(group.id, index, fileIds)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div>
                {editProduct?.files && editProduct.files.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Files</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {editProduct.files.map((file, index) => (
                        <div
                          key={file.id}
                          className="relative rounded-lg bg-muted overflow-hidden h-24 w-full flex items-center justify-center"
                        >
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${file.url}`}
                            alt={file.originalName}
                            className="object-cover h-full w-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.png";
                            }}
                          />
                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              // Remove from state
                              const updatedFiles = [...editProduct.files];
                              updatedFiles.splice(index, 1);
                              setEditProduct((prev: any) => ({
                                ...prev,
                                files: updatedFiles,
                              }));

                              // Call removeFile for backend handling
                              removeFile(editProduct.files[0].id);
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ProductMediaUpload for adding new files */}
                <div className="mt-4">
                  <ProductMediaUpload
                    files={mediaFiles}
                    onFilesChange={setMediaFiles}
                    onUpload={uploadImage}
                    onRemove={removeFile}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-accent">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={() => setDeleteProduct(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProduct?.modelName}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductTable;
