/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { secureStorage } from "@/security/SecureStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Category, CategoryResponse } from "./Products";
import { useNavigate, useParams } from "react-router-dom";
const ViewCategory = () => {
  const accessToken = secureStorage.get("accessToken");
  const [categories, setCategories] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  //   const handleDeleteProduct = async (productId: string) => {
  //     if (!confirm("Are you sure you want to delete this product?")) return;

  //     try {
  //       const res = await fetch(
  //         `${import.meta.env.VITE_API_URL}/products/${productId}`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //           },
  //         }
  //       );

  //       if (!res.ok) {
  //         toast.error("Failed to delete product");
  //         return;
  //       }

  //       setProducts(products.filter((p) => p.id !== productId));
  //       toast.success("Product deleted successfully!");
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Something went wrong!");
  //     }
  //   };

  //   const handleEditProduct = (product: any) => {
  //     setEditingProduct(product);
  //     setSelectedCategory(product.categoryId);
  //     setProductData(product);
  //   };
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
          categoryFiles: (category.fileRelations || []).map((fileObj: any) => ({
            id: fileObj.id || "",
            file: {
              url: fileObj.file?.url || "",
            },
          })),
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-bold text-2xl">All Categories</h1>
          <div className="bg-background rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No categories found. Add your first category!
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.categoryName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {category.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate("/dashboard/add-product", {
                                  state: { category },
                                })
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCategory;
