/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pencil, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/types/group";
import { useEffect, useState } from "react";

interface FieldRowProps {
  field: Field;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onUpdate: (field: Field) => void;
  group: any;
}

export function FieldRow({
  field,
  isEditing,
  onEdit,
  onRemove,
  onUpdate,
  group,
}: FieldRowProps) {
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") {
      setValue(field.fieldName); // Reset to original
      onEdit(); // Exit edit mode
    }
  };

  const [value, setValue] = useState(field.fieldName);

  // keep local state in sync when field changes
  useEffect(() => {
    setValue((field.fieldName = value));
  }, [field.fieldName]);

  const handleConfirm = () => {
    if (!value.trim() || value === field.fieldName) {
      onEdit(); // just exit edit mode
      return;
    }

    onUpdate(
      group?.id && !group
        ? {
            id: group.id,
            fieldName: value.trim(),
          }
        : {
            id: field.id,
            fieldName: value.trim(),
          }
    );

    onEdit(); // exit edit mode after update
  };
  return (
    <Card className="animate-fade-in border-border/60 shadow-soft">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <Label
                htmlFor={`field-name-${field.id}`}
                className="text-xs uppercase tracking-wide text-muted-foreground"
              >
                Field Names
              </Label>

              <Input
                id={`field-name-${field.id}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown} // <--- Add this
                disabled={!isEditing}
                placeholder="Enter field name"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 self-end sm:self-center mt-4">
            {!isEditing ? (
              <Button
                size="icon"
                onClick={onEdit}
                className="shrink-0 bg-[#163859] hover:bg-[#163859]"
                aria-label="Edit field"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleConfirm}
                className="shrink-0 bg-[#163859] hover:bg-[#163859]"
                aria-label="Confirm field edit"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
            )}

            <Button
              size="icon"
              onClick={onRemove}
              className="shrink-0 bg-[#163859] hover:bg-[#163859]"
              aria-label="Remove field"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
