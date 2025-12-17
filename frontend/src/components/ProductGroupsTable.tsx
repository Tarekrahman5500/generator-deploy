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
import { useEffect, useState } from "react";

interface ProductGroupsTableProps {
  categoryId: string;
  groups: ProductGroup[];
  onViewDetails: (group: ProductGroup) => void;
  onEdit: (group: ProductGroup) => void;
  onDelete: (id: string) => void;
}

export function ProductGroupsTable({
  categoryId,
  onViewDetails,
  onEdit,
  onDelete,
}: ProductGroupsTableProps) {
  const [groups, setGroups] = useState<ProductGroup[]>([]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/group/category/${categoryId}`
        );
        const data = await res.json();
        console.log(data);
        setGroups(data.groups || []);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      }
    };

    fetchGroups();
  }, [categoryId]);
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Group Name</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center py-12 text-muted-foreground"
              >
                No product groups found. Create your first group to get started.
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group) => (
              <TableRow key={group.id} className="group">
                <TableCell className="font-medium">{group.groupName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(group)}
                      className="text-muted-foreground hover:text-foreground"
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
