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

interface GroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ProductGroup | null;
  onSave: (group: ProductGroup) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function GroupFormModal({
  open,
  onOpenChange,
  group,
  onSave,
}: GroupFormModalProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryName, setCategory] = useState("");
  const [categories, setCategories] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [upsert, setUpsert] = useState(false);
  const accessToken = secureStorage.get("accessToken");

  useEffect(() => {
    if (group) {
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
      id: group.id,
      fieldName: "",
    };
    setFields([...fields, newField]);
    setEditingFieldId(newField.id);
    setUpsert(true);
  };

  const updateField = async (updatedField: Field) => {
    // optimistic UI update (correct)
    setFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f))
    );

    const body = {
      id: updatedField.id,
      fieldName: updatedField.fieldName,
    };

    try {
      const url = `${import.meta.env.VITE_API_URL}/field`;
      const options = {
        method: `${upsert ? "POST" : "PATCH"}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body)
      }
      const res = await fetch(url, options);

      if (!res.ok) {
        throw new Error("Failed to update field name");
      }

      toast.success("Field Name Updated successfully", {
        style: {
          background: "#326e12",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update field name", {
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

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (editingFieldId === id) {
      setEditingFieldId(null);
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

    const body = {
      groupName: name.trim(),
      categoryId: selectedCategoryId,
      fieldNames: fields.map((f) => f.fieldName.trim()),
    };

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

      toast.success(`${name}" group created successfully.`, {
        style: {
          background: "#326e12",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });

      onOpenChange(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save group.", {
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
  const updateGroupName = async () => {
    if (!group || !name.trim()) return;

    const body = {
      id: group.id,
      groupName: name.trim(),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to update group name");
      }

      toast.success("Group name updated successfully", {
        style: {
          background: "#326e12",
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update group name", {
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
            <Label htmlFor="group-name">Group Name</Label>

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
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
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
                        editingFieldId === field.id ? null : field.id
                      )
                    }
                    onRemove={() => removeField(field.id)}
                    onUpdate={updateField}
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
            <Button onClick={handleSave}>
              {group ? "Update Group" : "Create Group"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
