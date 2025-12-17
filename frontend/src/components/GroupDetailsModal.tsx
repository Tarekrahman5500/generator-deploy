import { FileText, Image as ImageIcon, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGroup } from "@/types/group";

interface GroupDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ProductGroup | null;
}

export function GroupDetailsModal({
  open,
  onOpenChange,
  group,
}: GroupDetailsModalProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {group.groupName}
          </DialogTitle>
          <DialogDescription>
            View details and associated fields for this group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Associated Fields
              </h3>
              <Badge variant="secondary">{group.fields.length} fields</Badge>
            </div>

            {group.fields.length > 0 ? (
              <div className="space-y-2">
                {group.fields.map((field) => (
                  <Card key={field.id}>
                    <CardContent className="flex items-center justify-between p-3">
                      <span className="font-medium text-foreground">
                        {field.fieldName}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground text-sm">
                  No fields defined for this group
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
