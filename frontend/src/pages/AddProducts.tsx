/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductInformation } from "@/components/ProductInformation";
import { ProductGroupDetails } from "@/components/ProductGroupDetails";
import {
  ProductMediaUpload,
  UploadedFile,
} from "@/components/ProductMediaUpload";
import { DocumentsUpload, UploadedDoc } from "@/components/DocumentsUpload";

import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "sonner";
import { secureStorage } from "@/security/SecureStorage";
const categories = [
  { id: "diesel-generator", label: "Diesel Generator" },
  { id: "compressor", label: "Compressor" },
  { id: "tower-light", label: "Tower Light" },
  { id: "ats", label: "ATS" },
  { id: "distributor-panel", label: "Distributor Panel" },
  { id: "forklift", label: "Forklift" },
  { id: "ups", label: "UPS" },
];

interface MediaFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  preview?: string;
}

export interface DocFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  type: string;
}

export default function AddProducts() {
  const location = useLocation();
  const { category } = location.state || {};
  const accessToken = secureStorage.get("accessToken");

  const [activeCategory, setActiveCategory] = useState("");
  const [disableOthers, setDisableOthers] = useState(false);
  const [currentGroup, setCurrentGroup] = useState("technical");
  const [productName, setProductName] = useState("");
  const [productModel, setProductModel] = useState("");
  const [description, setDescription] = useState("");
  const [groupValues, setGroupValues] = useState<Record<string, string>>({});

  const [docFiles, setDocFiles] = useState<UploadedDoc[]>([]);
  const [apiGroups, setApiGroups] = useState([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [removeFileId, setRemoveFileId] = useState<any>();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  // fetch categories first

  useEffect(() => {
    if (!category?.categoryName) return;
    if (categories.length === 0) return;

    const matched = categories.find(
      (c) => c.label.toLowerCase() === category.categoryName.toLowerCase(),
    );

    setActiveCategory(category?.categoryName);
    setDisableOthers(true);
  }, [category, categories]); // ✅ REQUIRED

  // fetch groups when activeCategory is set
  useEffect(() => {
    //console.log("effect-2 fired", activeCategory);

    //if (!activeCategory) return;
    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/group/category/${category.id}`,
        );

        const json = await res.json();
        setApiGroups(json.groups || []);
      } catch (err) {
        console.error(err);
        setApiGroups([]);
      }
    };

    fetchGroups();
  }, [category]);

  const handleCategoryChange = (categoryName: string) => {
    const matched = categories.find(
      (c) => c.label.toLowerCase() === categoryName.toLowerCase(),
    );

    if (matched) {
      setActiveCategory(matched.id); // activate the correct tab id
    }
    setCurrentGroup("technical");
    setGroupValues({});
  };

  const handleGroupValueChange = (fieldId: string, value: string) => {
    setGroupValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  /****Image upload functions */
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

  const information = Object.entries(groupValues).map(([fieldId, value]) => ({
    fieldId,
    value,
  }));
  const handleSave = async () => {
    if (!productModel.trim()) {
      toast.error("Product Model is required.", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }
    const body = {
      categoryId: category.id,
      modelName: productModel,
      description: description,
      information: information,
      fileIds: fileIds,
    };
    const url = `${import.meta.env.VITE_API_URL}/product`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    };
    const res = await fetch(url, options);
    if (res.status === 401) {
      secureStorage.clear();
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }
    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message, {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }
    setProductName("");
    setProductModel("");
    setDescription("");
    setGroupValues({});
    setMediaFiles([]);
    setDocFiles([]);
    toast.success("Product created successfully.", {
      style: {
        background: "#326e12", // your custom red
        color: "#fff",
        borderRadius: "10px",
        padding: "12px 16px",
      },
    });
  };

  const handleCancel = () => {
    setProductName("");
    setProductModel("");
    setDescription("");
    setGroupValues({});
    setMediaFiles([]);
    setDocFiles([]);
    toast.success("Form Cleared!", {
      style: {
        background: "#326e12", // your custom red
        color: "#fff",
        borderRadius: "10px",
        padding: "12px 16px",
      },
    });
  };

  const categoryLabel = activeCategory || "";

  const mappedGroups = apiGroups.map((group) => ({
    id: group.id,
    label: group.groupName, // map groupName → label
    fields: group.fields.map((field: any) => ({
      id: field.id,
      fieldName: field.fieldName,
    })),
  }));
  const removeFile = (id: string) => {
    const file = mediaFiles.find((f) => f.id === id);

    if (file?.backendId) {
      setFileIds((prev) => prev.filter((fid) => fid !== file.backendId));
    }

    setMediaFiles((prev) => prev.filter((f) => f.id !== id));
  };
  const uploadPdf = async (files: UploadedDoc[]) => {
    files.forEach(async (fileObj) => {
      setIsUploading(true);
      console.log(fileObj);
      const formData = new FormData();
      formData.append("file", fileObj.file);
      formData.append("language", fileObj.language);
      const accessToken = await secureStorage.getValidToken();
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${import.meta.env.VITE_API_URL}/file/pdf`);
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

  const handleUploadError = (id: string) => {
    setDocFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "error" } : f)),
    );
  };
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add Product
          </h1>
          <p className="text-muted-foreground">
            Create a new inventory item by selecting the appropriate category.
          </p>
        </header>

        {/* Category Tabs */}
        <div className="mb-8">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            disableOthers={disableOthers}
          />
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Product Information - Left Column */}
          <div className="lg:col-span-4">
            <ProductInformation
              productName={productName}
              productModel={productModel}
              description={description}
              onProductNameChange={setProductName}
              onProductModelChange={setProductModel}
              onDescriptionChange={setDescription}
            />
          </div>

          {/* Product Group Details - Right Column */}
          <div className="lg:col-span-8">
            <ProductGroupDetails
              groups={mappedGroups}
              currentGroup={currentGroup}
              onGroupChange={setCurrentGroup}
              values={groupValues}
              onValueChange={handleGroupValueChange}
              categoryLabel={categoryLabel}
            />
          </div>
        </div>

        {/* Upload Sections - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button size="lg" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="lg" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}
