/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProductGroup } from "@/types/group";
import { toast } from "@/hooks/use-toast";
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
import { Category, CategoryResponse } from "./Products";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGroupsTable } from "@/components/ProductGroupsTable";
import { GroupFormModal } from "@/components/GroupFormModal";
import { GroupDetailsModal } from "@/components/GroupDetailsModal";

// Sample data
///group/category/categoryId
export default function ProductsAdd() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(""); // store ID
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(""); // store ID

  const filteredGroups = groups.filter((group) =>
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
        const json = await res.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories: Category[] = json.categories.map((category: any) => ({
          id: category.id || "",
          categoryName: category.categoryName || "",
          description: category.description || "",
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
      }
    };

    fetchCategories();
  }, []);
  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/group/category/${selectedCategoryId}`
      );
      const data = await res.json();
      console.log(data);
      setGroups(data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };
  useEffect(() => {
    if (!selectedCategoryId) return;

    fetchGroups();
  }, [selectedCategoryId]);
  const handleSaveGroup = (group: ProductGroup) => {
    const existingIndex = groups.findIndex((g) => g.id === group.id);
    if (existingIndex >= 0) {
      const updated = [...groups];
      updated[existingIndex] = group;
      setGroups(updated);
    } else {
      setGroups([...groups, group]);
    }
    fetchGroups();
  };

  const handleViewDetails = (group: ProductGroup) => {
    setSelectedGroup(group);
    setIsDetailsOpen(true);
  };

  const handleEdit = (group: ProductGroup) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
    fetchGroups();
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      const groupName = groups.find((g) => g.id === deleteId)?.groupName;
      setGroups(groups.filter((g) => g.id !== deleteId));
      toast({
        title: "Group Deleted",
        description: `"${groupName}" has been deleted successfully`,
      });
      setDeleteId(null);
    }
    fetchGroups();
  };

  const handleAddNew = () => {
    setSelectedGroup(null);
    setIsFormOpen(true);
    fetchGroups();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl">
                  Category Groups
                </CardTitle>
                <CardDescription className="mt-1">
                  Manage your category groups and their associated fields.
                </CardDescription>
              </div>
              <Button
                onClick={handleAddNew}
                className="shrink-0 bg-accent hover:bg-accent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by group name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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

            {/* Table */}
            <ProductGroupsTable
              categoryId={selectedCategoryId}
              groups={groups}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          </CardContent>
        </Card>

        {/* Form Modal */}
        <GroupFormModal
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          group={selectedGroup}
          onSave={handleSaveGroup}
        />

        {/* Details Modal */}
        <GroupDetailsModal
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          group={selectedGroup}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this group? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
