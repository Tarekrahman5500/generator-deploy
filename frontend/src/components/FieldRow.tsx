/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pencil, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/types/group";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";

interface FieldRowProps {
  serialNo?: number;
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
  const [value, setValue] = useState(field?.fieldName || "");
  const [serialNo, setSerialNo] = useState(field?.serialNo || 0);

  // 1. New Boolean States
  const [order, setorder] = useState(field?.order || false);
  const [filter, setfilter] = useState(field?.filter || false);

  useEffect(() => {
    setValue(field.fieldName);
    setSerialNo(field.serialNo || 0);
    setorder(field.order || false);
    setfilter(field.filter || false);
  }, [field.fieldName, field.serialNo, field.order, field.filter]);

  const handleConfirm = () => {
    const hasChanged =
      value !== field.fieldName ||
      serialNo !== field.serialNo ||
      order !== field.order ||
      filter !== field.filter;

    if (!value.trim() || !hasChanged) {
      onEdit();
      return;
    }

    // 2. Pass the toggle values in the update body
    onUpdate({
      ...field,
      id: field.id,
      fieldName: value.trim(),
      serialNo: Number(serialNo),
      order: order,
      filter: filter,
    });

    onEdit();
  };

  return (
    <Card className="animate-fade-in border-border/60 shadow-soft">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Field Name */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Field Name
              </Label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Serial No */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Serial No
              </Label>
              <Input
                type="number"
                value={serialNo}
                onChange={(e) => setSerialNo(Number(e.target.value))}
                disabled={!isEditing}
              />
            </div>

            {/* Toggle 1: Required */}
            <div className="flex flex-col justify-center space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Order
              </Label>
              <div className="flex items-center h-10">
                <Switch
                  checked={order}
                  onCheckedChange={setorder}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Toggle 2: Active */}
            <div className="flex flex-col justify-center space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                Filter
              </Label>
              <div className="flex items-center h-10">
                <Switch
                  checked={filter}
                  onCheckedChange={setfilter}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 self-end lg:self-center mt-4 lg:mt-6">
            {!isEditing ? (
              <Button size="icon" onClick={onEdit} className="bg-[#163859]">
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleConfirm}
                className="bg-[#163859]"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
            )}
            <Button size="icon" onClick={onRemove} className="bg-[#163859]">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

//  const handleConfirm = () => {
//     if (!value.trim() || value === field.fieldName) {
//       onEdit(); // just exit edit mode
//       return;
//     }
//     console.log(group?.id && !group);

//     onUpdate(
//       group?.id && !group
//         ? {
//             id: group.id,
//             fieldName: value.trim(),
//           }
//         : {
//             id: field.id,
//             fieldName: value.trim(),
//           },
//     );

//     onEdit(); // exit edit mode after update
//   };
