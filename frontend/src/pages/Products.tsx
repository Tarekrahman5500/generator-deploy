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
import GeneratorFilterCard from "./ProductFilter";

import { useNavigate } from "react-router-dom";

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
  serialNo?: number;
}

export interface CategoryResponse {
  statusCode: number;
  categories: Category[];
}

const Products = () => {
  const location = useLocation();

  // 1. Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filterValues, setFilterValues] = useState<any>({});
  const [activeFilterPayload, setActiveFilterPayload] = useState<any | null>(
    null,
  );

  // 2. Loading & UI States
  const [loading, setLoading] = useState(true); // Initial category fetch
  const [filterLoading, setFilterLoading] = useState(false); // Product/Filter fetch
  const [isFilterActive, setIsFilterActive] = useState(false);

  // 3. Selection & Pagination States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const saved = sessionStorage.getItem("selectedCategoryName");
    return saved || location.state?.category?.categoryName || null;
  });
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = sessionStorage.getItem("currentPage");
    return saved ? parseInt(saved) : 1;
  });
  const [meta, setMeta] = useState({ totalPages: 1, total: 0, page: 1 });

  // Sync session storage when currentPage changes
  useEffect(() => {
    sessionStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  // Sync session storage when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem("selectedCategoryName", selectedCategory);
    } else {
      sessionStorage.removeItem("selectedCategoryName");
      sessionStorage.removeItem("activeFilterPayload"); // Clear filters if category cleared
    }
  }, [selectedCategory]);

  // Sync session storage when activeFilterPayload changes
  useEffect(() => {
    if (activeFilterPayload) {
      sessionStorage.setItem("activeFilterPayload", JSON.stringify(activeFilterPayload));
    } else {
      sessionStorage.removeItem("activeFilterPayload");
    }
  }, [activeFilterPayload]);

  // Fetch initial Category List (once)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
        const json = await res.json();
        const cats = json.categories || [];
        setCategories(cats);

        // Recover active filter payload if it exists
        const savedPayload = sessionStorage.getItem("activeFilterPayload");
        if (savedPayload) {
          const payload = JSON.parse(savedPayload);
          setActiveFilterPayload(payload);
          setIsFilterActive(true);
        }
      } catch (err) {
        console.error("Category fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // MAIN SYNC: Fetch Products and Filter Schema whenever Category or Page changes
  useEffect(() => {
    if (!categories.length) return;

    const catId = categories.find(
      (c) => c.categoryName === selectedCategory,
    )?.id;

    const fetchByCategory = async () => {
      try {
        setFilterLoading(true);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/search/product`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categoryId: catId || undefined,
              page: currentPage,
              limit: 12,
            }),
          },
        );

        const json = await res.json();

        setFilteredProducts(json?.products?.length > 0 ? json?.products : []);
        setFilterValues(json?.filterValues || {}); // ✅ ONLY HERE

        setMeta({
          totalPages: json?.meta?.totalPages || 1,
          total: json?.meta?.total || 0,
          page: json?.meta?.page || 1,
        });

        setIsFilterActive(!!selectedCategory);
      } catch (err) {
        console.error(err);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchByCategory();
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (!categories.length) return;

    const fetchPage = async () => {
      try {
        // ✅ FILTER MODE
        if (isFilterActive && activeFilterPayload) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/search/filter`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...activeFilterPayload,
                page: currentPage,
              }),
            },
          );

          const json = await res.json();

          setFilteredProducts(json?.products || []);

          setMeta({
            totalPages: json?.meta?.totalPages || 1,
            total: json?.meta?.total || 0,
            page: json?.meta?.page || currentPage,
          });
        }

        // ✅ NORMAL MODE
        else {
          const catId = categories.find(
            (c) => c.categoryName === selectedCategory,
          )?.id;

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/search/product`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                categoryId: catId || undefined,
                page: currentPage,
                limit: 12,
              }),
            },
          );

          const json = await res.json();

          setFilteredProducts(json?.products || []);

          setMeta({
            totalPages: json?.meta?.totalPages || 1,
            total: json?.meta?.total || 0,
            page: json?.meta?.page || currentPage,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPage();
  }, [currentPage, isFilterActive, activeFilterPayload]);

  // Derived State: Grouping products by Category Name
  const groupedResults = useMemo(() => {
    // Apply Sub-Category filtering locally if checkboxes are checked
    const visibleProducts =
      selectedSubCategories.length > 0
        ? filteredProducts.filter((p) =>
          selectedSubCategories.includes(p.subCategory?.subCategoryName),
        )
        : filteredProducts;

    return visibleProducts.reduce((acc: Record<string, any[]>, product) => {
      const catName = product.category?.categoryName || "Industrial Equipment";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(product);
      return acc;
    }, {});
  }, [filteredProducts, selectedSubCategories]);

  // Derived State: Get unique subcategories for the sidebar based on current products
  const availableSubCategories = useMemo(() => {
    const subs = filteredProducts
      .map((p) => p.subCategory?.subCategoryName)
      .filter(Boolean);
    return [...new Set(subs)] as string[];
  }, [filteredProducts]);

  const currentCategoryId = useMemo(
    () => categories.find((c) => c.categoryName === selectedCategory)?.id,
    [categories, selectedCategory],
  );
  const navigate = useNavigate();

  if (isFilterActive && filteredProducts.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <div className="col-span-full flex flex-col items-center py-20">
          <p>No products matched your filters</p>
          <Button
            variant="link"
            onClick={() => {
              setIsFilterActive(false);
              navigate("/products");
            }}
          >
            View All
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922]">
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-[#182129] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategories([]);
                    setIsFilterActive(false);
                    setCurrentPage(1);
                    setActiveFilterPayload(null); // Fix: also clear payload
                    sessionStorage.removeItem("selectedCategoryName");
                    sessionStorage.removeItem("activeFilterPayload");
                    sessionStorage.removeItem("currentPage");
                  }}
                  className="text-xs text-[#163859] font-bold hover:underline"
                >
                  CLEAR ALL
                </button>
              </div>

              <div className="space-y-6">
                {/* Inside the sidebar space-y-6 div */}

                {/* 1. Main Category Selector */}
                <FilterGroup
                  title="Categories"
                  type="radio"
                  items={categories.map((c) => c.categoryName)}
                  selected={selectedCategory}
                  onChange={(val: any) => {
                    setSelectedCategory(val);
                    setSelectedSubCategories([]);
                    setCurrentPage(1);
                  }}
                />

                {/* 2. Dynamic Generator Filters (The one causing the issue) */}

                {/* 3. Sub-Category Checkboxes */}
                {availableSubCategories.length > 0 && (
                  <FilterGroup
                    title="Sub-Categories"
                    type="checkbox"
                    items={availableSubCategories}
                    selected={selectedSubCategories}
                    onChange={(val: string) => {
                      setSelectedSubCategories((prev) =>
                        prev.includes(val)
                          ? prev.filter((i) => i !== val)
                          : [...prev, val],
                      );
                    }}
                  />
                )}

                <GeneratorFilterCard
                  // This is the filterValues we got from /search/product
                  setFilterValues={setFilterValues}
                  filters={filterValues}
                  loading={filterLoading}
                  categoryId={currentCategoryId}
                  setProducts={setFilteredProducts}
                  setIsFilterActive={setIsFilterActive}
                  setCurrentPage={setCurrentPage}
                  setActiveFilterPayload={setActiveFilterPayload}
                />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {filterLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedResults).map(
                  ([catName, products]: [string, any[]]) => (
                    <div key={catName} className="space-y-6">
                      <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-black text-[#163859] italic uppercase">
                          {catName}
                        </h2>
                        <span className="text-xs font-bold text-muted-foreground">
                          {products.length} Items
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {
                          // ✅ NORMAL RENDERING
                          products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                          ))
                        }
                      </div>
                    </div>
                  ),
                )}

                {/* Global Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="text-white font-bold rounded-full bg-[#163859] h-3 w-3 p-5 hover:bg-[#163859] hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1 text-center font-bold" />
                    </Button>
                    <span className="text-sm font-bold">
                      Page {currentPage} of {meta.totalPages}
                    </span>
                    <Button
                      disabled={currentPage === meta.totalPages}
                      // Change this line below:
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="text-white font-bold rounded-full bg-[#163859] h-3 w-3 p-5 hover:bg-[#163859] hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4 ml-1 text-center font-bold" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export const ProductCard = ({ product }: { product: any }) => {
  const handleCompare = () => {
    // 1. Get existing data from localStorage
    const compareData = JSON.parse(
      localStorage.getItem("compare") ||
      '{"productIds": [], "product": [], "productCategories": []}',
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
        "Please select products from the same category to compare.",
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

  const getImageUrl = (path?: string) =>
    path ? `${import.meta.env.VITE_API_URL}/${path}` : "/placeholder.png";
  return (
    <div className="group bg-white dark:bg-[#182129] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 flex flex-col">
      {/* Image Section */}

      <div className="aspect-square relative overflow-hidden bg-gray-50">
        {product.files
          ?.filter(
            (file: any) =>
              file.mimeType === "image/png" ||
              file.mimeType === "image/jpeg" ||
              file.mimeType === "image/gif",
          )
          .slice(0, 1) // Ensure we only work with the first valid image found
          .map((image: any) => (
            <img
              src={getImageUrl(image.url)}
              alt={product.modelName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ))}

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
              className={`w-4 h-4 border-gray-300 text-[#163859] focus:ring-[#163859] ${type === "radio" ? "rounded-full" : "rounded"
                }`}
            />
            <span
              className={`text-sm font-medium transition-colors ${(
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
