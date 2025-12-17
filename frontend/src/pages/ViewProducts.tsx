import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { NavLink } from "@/components/NavLink";
import ProductTable from "@/components/ProductTable";

// Meta
export interface Meta {
  total: number;
  page: number;
  limit: number;
  perPage: number;
  totalPages: number;
}

// Category info inside product
export interface ProductCategory {
  id: string;
  categoryName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Group field
export interface GroupField {
  fieldName: string;
  value: string;
  fieldId: string;
  valueId: string;
}

// Group object (dynamic keys like General, Technology)
export interface ProductGroup {
  [groupName: string]: GroupField[];
}

// File info
export interface ProductFile {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  usedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Product
export interface Product {
  id: string;
  modelName: string;
  description: string;
  category: ProductCategory;
  group: ProductGroup;
  files: ProductFile[];
}

// API response
export interface CategoryProductsResponse {
  category: {
    meta: Meta;
    products: Product[];
  };
}

const ViewProducts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // console.log("Fetching page:", page);
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const fetchCategoryProducts = async (
    page = 1,
    limit = 10
  ): Promise<CategoryProductsResponse> => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/category/products`);

    url.searchParams.set("page", page.toString());
    url.searchParams.set("limit", limit.toString());

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error("Failed to fetch category products");
    }
    setLoading(false);
    return res.json();
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchCategoryProducts(currentPage, 10);

        setProducts(data.category.products);
        setMeta(data.category.meta);
      } catch (error) {
        console.error(error);
      }
    };

    loadProducts();
  }, [currentPage]);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">All Products</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>

        <ProductTable
          loading={loading}
          products={products}
          meta={{ ...meta, page: currentPage }}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
};

export default ViewProducts;
