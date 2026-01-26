import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductGroup } from "@/types/group";

interface ProductGroupsTableProps {
  serialNo?: number;
  categoryId: string;
  groups: ProductGroup[];
  onViewDetails: (group: ProductGroup) => void;
  onEdit: (group: ProductGroup) => void;
  onDelete: (id: string) => void;
}

export function ProductGroupsTable({
  groups,
  onViewDetails,
  onEdit,
  onDelete,
}: ProductGroupsTableProps) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Serial Name</TableHead>
            <TableHead className="font-semibold">Group Name</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-12 text-muted-foreground"
              >
                No product groups found. Create your first group to get started.
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group) => (
              <TableRow key={group.id} className="group">
                <TableCell className="font-medium">{group.serialNo}</TableCell>
                <TableCell className="font-medium">{group.groupName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(group)}
                      className="text-white hover:text-white bg-[#163859] hover:bg-[#163859]"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(group)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(group.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
