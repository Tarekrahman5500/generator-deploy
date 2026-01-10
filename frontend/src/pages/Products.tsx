/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { SkeletonCard } from "@/components/Skeleton/SkeletonLoading";
import { useLocation, useParams } from "react-router-dom";
import empty from "../assets/no-data-found.png";
import ImageLoader from "@/components/Skeleton/ImageLoader";
import ProductCardSkeleton from "@/components/Skeleton/ProductSkeleton";
import {
  ArrowLeftRight,
  Badge,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
// Interfaces for your API data
interface File {
  url: string;
  id: string;
}

interface CategoryFile {
  id: string;
  file: File;
}

export interface Category {
  id: string;
  categoryId: string;
  type: string;
  categoryName: string;
  loadCapacityKg: number;
  maxLiftHeightM: GLfloat;
  mastType: string;
  powerSource: string;
  tireType: string;
  turningRadiusM: number;
  description: string;
  categoryFiles: CategoryFile[];
  products: Record<string, any>[];
  subCategories: Record<string, any>[];
}

export interface CategoryResponse {
  statusCode: number;
  categories: Category[];
}
const Products = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    location.state?.category?.categoryName || null
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
        const json = await res.json();
        setCategories(json.categories || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 1. Get unique Sub-Categories for the selected Category
  const availableSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.categoryName === selectedCategory);
    if (!cat || !cat.products) return [];

    // Extract unique subCategoryNames from the products in this category
    const subs = cat.products
      .map((p: any) => p.subCategory?.subCategoryName)
      .filter(Boolean);
    return [...new Set(subs)] as string[];
  }, [selectedCategory, categories]);

  // 2. Filter Logic
  const filteredData = useMemo(() => {
    let result = categories;

    // Filter by Category
    if (selectedCategory) {
      result = result.filter((c) => c.categoryName === selectedCategory);
    }

    // Note: Sub-category filtering happens inside the CategorySection
    // or by passing the array down
    return result;
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922]">
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-[#182129] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategories([]);
                  }}
                  className="text-xs text-[#163859] font-bold hover:underline"
                >
                  CLEAR ALL
                </button>
              </div>

              <div className="space-y-6">
                {/* Main Category Filter (Radio-like behavior) */}
                <FilterGroup
                  title="Categories"
                  type="radio"
                  items={categories.map((c) => c.categoryName)}
                  selected={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setSelectedSubCategories([]); // Reset subs when main cat changes
                  }}
                />

                {/* Dynamic Sub-Category Filter */}
                {selectedCategory && availableSubCategories.length > 0 && (
                  <FilterGroup
                    title="Sub-Categories"
                    type="checkbox"
                    items={availableSubCategories}
                    selected={selectedSubCategories}
                    onChange={(val) => {
                      if (Array.isArray(selectedSubCategories)) {
                        setSelectedSubCategories((prev) =>
                          prev.includes(val)
                            ? prev.filter((i) => i !== val)
                            : [...prev, val]
                        );
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <Skeleton className="w-full h-[500px]" />
            ) : (
              filteredData.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  activeSubFilters={selectedSubCategories}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
const CategorySection = ({
  category,
  activeSubFilters,
}: {
  category: any;
  activeSubFilters: string[];
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const PAGE_LIMIT = 8; // Your requested perPage limit

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Using the page and limit parameters from state
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/category/products?categoryId=${
            category.id
          }&page=${currentPage}&limit=${PAGE_LIMIT}`
        );
        const json = await res.json();

        setProducts(json?.category.products || []);
        setMeta({
          totalPages: json?.category.meta?.totalPages || 1,
          total: json?.category.meta?.total || 0,
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category.id, currentPage]); // Re-fetch when page changes

  // Group products by subCategoryName
  const groupedProducts = useMemo(() => {
    const filtered =
      activeSubFilters.length > 0
        ? products.filter((p) =>
            activeSubFilters.includes(p.subCategory?.subCategoryName)
          )
        : products;

    return filtered.reduce((acc: Record<string, any[]>, product) => {
      // 1. Get the subcategory name
      const subName =
        product.subCategory?.subCategoryName || "General Equipment";

      // 2. Corrected Logic: If the key doesn't exist, create it as an empty array
      if (!acc[subName]) {
        acc[subName] = [];
      }

      // 3. Push the product into that array
      acc[subName].push(product);

      return acc;
    }, {});
  }, [products, activeSubFilters]);

  if (!loading && products.length === 0 && activeSubFilters.length === 0)
    return null;

  return (
    <div className="mb-24 pb-12 border-b border-gray-100 dark:border-gray-800 last:border-0">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-[#163859] dark:text-white uppercase italic tracking-tighter">
            {category.categoryName}
          </h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Total Results: {meta.total}
          </p>
        </div>
        <div className="h-[2px] hidden md:block flex-1 mx-8 bg-gradient-to-r from-[#163859]/10 to-transparent"></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : (
        <>
          {Object.entries(groupedProducts).map(
            ([subName, subProducts]: [string, any]) => (
              <div key={subName} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-[#163859] text-white text-[10px] font-black px-3 py-1 uppercase tracking-tighter">
                    {subName}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {subProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="border-[#163859] text-[#163859] font-bold hover:bg-[#163859] hover:text-white transition-all"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> PREV
              </Button>

              <div className="flex items-center gap-2">
                {[...Array(meta.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? "bg-[#163859] text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === meta.totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="border-[#163859] text-[#163859] font-bold hover:bg-[#163859] hover:text-white transition-all"
              >
                NEXT <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
const ProductCard = ({ product }: { product: any }) => {
  const handleCompare = () => {
    // 1. Get existing data from localStorage
    const compareData = JSON.parse(
      localStorage.getItem("compare") ||
        '{"productIds": [], "product": [], "productCategories": []}'
    );

    const {
      productIds,
      productCategories,
      product: compareProducts,
    } = compareData;

    // 2. Logic Guard: Prevent duplicate
    if (productIds.includes(product.id)) {
      toast.warning("This product is already in your comparison list.");
      return;
    }

    // 3. Logic Guard: Max 3 products
    if (productIds.length >= 3) {
      toast.error("You can only compare up to 3 products at a time.");
      return;
    }

    // 4. Logic Guard: Same Category Check
    if (
      productCategories.length > 0 &&
      productCategories[0] !== product.category?.categoryName
    ) {
      toast.warning(
        "Please select products from the same category to compare."
      );
      return;
    }

    // 5. Update Storage
    const updatedData = {
      productIds: [...productIds, product.id],
      productCategories: [...productCategories, product.category?.categoryName],
      product: [...compareProducts, product], // Storing full object for the comparison table
      products: [
        ...(compareData.products || []),
        { id: product.id, modelName: product.modelName },
      ],
    };

    localStorage.setItem("compare", JSON.stringify(updatedData));

    // 6. Trigger Event for Floating UI / Navbar badges
    window.dispatchEvent(new Event("compareUpdated"));

    toast.success(`${product.modelName} added to comparison`, {
      style: { background: "#163859", color: "#fff" },
    });
  };

  return (
    <div className="group bg-white dark:bg-[#182129] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 flex flex-col">
      {/* Image Section */}
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        <img
          src={
            product.files?.[0]?.url
              ? `${import.meta.env.VITE_API_URL}/${product.files[0].url}`
              : "/placeholder.png"
          }
          alt={product.modelName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#163859]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <span className="text-[10px] font-bold tracking-widest text-[#163859] dark:text-blue-400 uppercase">
            {product.category?.categoryName || "Industrial"}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-1 line-clamp-2 uppercase italic">
            {product.modelName}
          </h3>
        </div>

        {/* Technical Specs Preview */}
        <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
          {product.group && Object.values(product.group)[0] ? (
            (Object.values(product.group)[0] as any)
              .slice(0, 4)
              .map((item: any, i: number) => (
                <div
                  key={i}
                  className="border-l-2 border-gray-100 dark:border-gray-800 pl-2"
                >
                  <p className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                    {item.fieldName}
                  </p>
                  <p className="font-bold text-xs text-slate-700 dark:text-gray-200 truncate">
                    {item.value || "-"}
                  </p>
                </div>
              ))
          ) : (
            <p className="col-span-2 text-gray-400 text-xs italic">
              Specifications pending...
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            asChild
            className="w-full bg-[#163859] hover:bg-[#163859]/90 text-white font-bold h-11"
          >
            <NavLink to={`/product/${product.id}`}>VIEW DETAILS</NavLink>
          </Button>

          <Button
            variant="outline"
            onClick={handleCompare}
            className="w-full border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-[#163859]/90 dark:bg-slate-50 flex items-center gap-2 h-11 font-semibold"
          >
            <ArrowLeftRight className="h-4 w-4" />
            COMPARE PRODUCT
          </Button>
        </div>
      </div>
    </div>
  );
};
const FilterGroup = ({
  title,
  items,
  selected,
  onChange,
  type = "checkbox",
}: any) => {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
      <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-gray-400">
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((item: string) => (
          <label
            key={item}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type={type}
              name={title} // Important for radio behavior
              checked={
                Array.isArray(selected)
                  ? selected.includes(item)
                  : selected === item
              }
              onChange={() => onChange(item)}
              className={`w-4 h-4 border-gray-300 text-[#163859] focus:ring-[#163859] ${
                type === "radio" ? "rounded-full" : "rounded"
              }`}
            />
            <span
              className={`text-sm font-medium transition-colors ${
                (
                  Array.isArray(selected)
                    ? selected.includes(item)
                    : selected === item
                )
                  ? "text-[#163859] font-bold"
                  : "text-gray-600 dark:text-gray-300 group-hover:text-[#163859]"
              }`}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default Products;
