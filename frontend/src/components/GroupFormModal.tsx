/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Check, Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FieldRow } from "@/components/FieldRow";
import { FileUpload } from "@/components/FileUpload";
import { ProductGroup, Field } from "@/types/group";
import { toast } from "sonner";
import { secureStorage } from "@/security/SecureStorage";
import { Category, CategoryResponse } from "@/pages/Products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { access } from "fs";
import { useNavigate } from "react-router-dom";

interface GroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ProductGroup | null;
  onSave: (group: ProductGroup) => void;
  refetch: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function GroupFormModal({
  open,
  onOpenChange,
  group,
  onSave,
  refetch,
}: GroupFormModalProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [serialNo, setSerialNo] = useState(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryName, setCategory] = useState("");
  const [categories, setCategories] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [upsert, setUpsert] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (group) {
      setSerialNo(group.serialNo);
      setName(group.groupName);
      setFields(group.fields);
    } else {
      setName("");
      setFields([]);
    }
    setEditingFieldId(null);
  }, [group, open]);
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/category/list`);
      const json = await res.json();
      const categories: Category[] = json.categories.map((category: any) => ({
        id: category.id || "",
        categoryName: category.categoryName || "",
        description: category.description || "",
      }));
      setCategories({ statusCode: res.status, categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories({ statusCode: 500, categories: [] });
    }
  };
  useEffect(() => {
    if (!open) return;
    if (categories.categories.length > 0) return;

    fetchCategories();
  }, [open]);

  const addField = () => {
    const newField: Field = {
      // Generate a unique ID for the field, NOT the group ID
      id: crypto.randomUUID(),
      fieldName: "",
      serialNo: fields.length + 1,
      order: false, // Toggle 1
      filter: false, // Toggle 2
    };

    setFields([...fields, newField]);
    setEditingFieldId(newField.id); // Now this points to the specific new field
    setUpsert(true);
  };
  const updateField = async (updatedField: Field) => {
    // optimistic UI update (correct)
    setFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f)),
    );
    if (!group) {
      setEditingFieldId(null); // Just close the edit mode
      return;
    }
    const body = {
      id: updatedField.id,
      serialNo: updatedField.serialNo,

      fieldName: updatedField.fieldName,
      filter: updatedField.filter,
      order: updatedField.order,
    };

    try {
      const accessToken = await secureStorage.getValidToken();
      const url = `${import.meta.env.VITE_API_URL}/field`;

      const options = {
        method: `POST`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      };
      const res = await fetch(url, options);
      const data = await res.json();
      if (res.status === 401) {
        secureStorage.clear();
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      if (!res.ok) {
        throw new Error(`${data.message}`);
      }

      toast.success(`${updatedField.fieldName} updated successfully`, {
        style: {
          background: "#326e12",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      refetch();
    } catch (error) {
      toast.error(`${error.message}`, {
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

  const removeField = async (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (editingFieldId === id) {
      setEditingFieldId(null);
    }

    if (id) {
      const accessToken = await secureStorage.getValidToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/field/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === 401) {
        secureStorage.clear();
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      if (res.ok) {
        toast.success("Field Deleted Successfully", {
          style: {
            background: "#326e12",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        refetch();
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a group name", {
        style: {
          background: "#ff0000",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a category", {
        style: {
          background: "#ff0000",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }
    const validFields = fields.filter((f) => f.fieldName.trim() !== "");

    // 2. Check if we have any valid fields
    if (validFields.length === 0) {
      toast.error("Please Insert at least one Field Name", {
        style: { background: "#ff0000", color: "#fff" },
      });
      return;
    }
    const body = {
      groupName: name.trim(),
      categoryId: selectedCategoryId,
      fieldNames: validFields.map((f) => ({
        name: f.fieldName.trim(),
        serialNo: f.serialNo,
        filter: f.filter,
        order: f.order,
      })),
    };

    if (body.fieldNames.length === 0) {
      toast.error("Please Insert Field Name", {
        style: {
          background: "#ff0000",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }
    const accessToken = await secureStorage.getValidToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      //console.log("API Response:", json);
      if (res.status === 401) {
        secureStorage.clear();
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      if (res.ok) {
        toast.success(`"${name}" group created successfully.`, {
          style: {
            background: "#326e12",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
      }
      if (!res.ok) {
        throw new Error(`${json.message}`);
      }

      if (json.statusCode === 901) {
        toast.error(`${json.message}`, {
          style: {
            background: "#ff0000",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        return;
      }
      onOpenChange(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(`${err.message}`, {
        style: {
          background: "#ff0000",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    }
  };

  /*******update group*********** */
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [isEditingSerialNo, setIsEditingSerialNo] = useState(false);
  const updateGroupName = async () => {
    if (!group || !name.trim()) return;

    const body = {
      id: group.id,
      groupName: name.trim(),
      serialNo: Number(serialNo),
    };
    const accessToken = await secureStorage.getValidToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(`${data.message}`);
      }

      toast.success(
        `${
          body?.groupName ? body.groupName : "Group Name"
        } updated successfully`,
        {
          style: {
            background: "#326e12",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        },
      );
      refetch();
    } catch (error) {
      toast.error(`${error.message}`, {
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
  const handleFieldChange = (id: string, value: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, fieldName: value } : field,
      ),
    );
    setUpsert(true); // Mark that changes have been made
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {group ? "Edit Group" : "Add New Group"}
          </DialogTitle>
          <DialogDescription>
            {group
              ? "Update the group details and fields below."
              : "Create a new product group with custom fields."}
          </DialogDescription>
        </DialogHeader>
        {!group && (
          <div className="mt-4">
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>

              <SelectContent>
                {categories?.categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-6 py-4">
          {/* Group Name */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                id="serial-no"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                placeholder="Enter Serial No"
                disabled={!!group && !isEditingSerialNo}
                className="flex-1"
              />

              {group &&
                (!isEditingSerialNo ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingSerialNo(true)}
                    aria-label="Edit Serial No"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      updateGroupName();
                      setIsEditingSerialNo(false);
                    }}
                    aria-label="Save group name"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                disabled={!!group && !isEditingGroupName}
                className="flex-1"
              />

              {group &&
                (!isEditingGroupName ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingGroupName(true)}
                    aria-label="Edit group name"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      updateGroupName();
                      setIsEditingGroupName(false);
                    }}
                    aria-label="Save group name"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                ))}
            </div>
          </div>

          <Separator />

          {/* Associated Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Associated Fields</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addField}
                className="text-primary hover:text-white hover:bg-[#163859]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Field
              </Button>
            </div>

            {fields.length > 0 ? (
              <div className="space-y-3">
                {fields.map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    isEditing={editingFieldId === field.id}
                    onEdit={() =>
                      setEditingFieldId(
                        editingFieldId === field.id ? null : field.id,
                      )
                    }
                    onRemove={() => removeField(field.id)}
                    onUpdate={updateField}
                    group={group}
                  />
                ))}
              </div>
            ) : (
              <Card
                className="border-2 border-dashed border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={addField}
              >
                <CardContent className="flex flex-col items-center justify-center gap-2 py-8">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Add another field</p>
                  <p className="text-xs text-muted-foreground">
                    Define custom properties for this group
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />
        </div>

        {/* Actions */}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!group && (
            <Button
              onClick={handleSave}
              className="bg-[#163859] hover:bg-[#163859]"
            >
              {group ? "Update Group" : "Create Group"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
