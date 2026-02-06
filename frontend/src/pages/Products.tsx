/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import ProductCardSkeleton from "@/components/Skeleton/ProductSkeleton";
import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import GeneratorFilterCard from "./ProductFilter";
import { NavLink } from "@/components/NavLink";

const Products = () => {
  const location = useLocation();
  const navType = useNavigationType();

  // 1. Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filterValues, setFilterValues] = useState<any>({});
  const [activeFilterPayload, setActiveFilterPayload] = useState<any | null>(null);

  // 2. Loading & UI States
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // 3. Selection & Pagination States - Recovered from Session
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    // If coming from a fresh click on Index/Footer, use that. Otherwise, check session.
    const fromState = location.state?.category?.categoryName;
    const saved = sessionStorage.getItem("selectedCategoryName");
    if (navType !== "POP" && fromState) return fromState;
    return saved || fromState || null;
  });

  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (navType !== "POP" && location.state?.category) return 1;
    const saved = sessionStorage.getItem("currentPage");
    return saved ? parseInt(saved) : 1;
  });

  const [meta, setMeta] = useState({ totalPages: 1, total: 0, page: 1 });

  // Persistence Effects
  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem("selectedCategoryName", selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem("isFilterActive", isFilterActive.toString());
  }, [isFilterActive]);

  useEffect(() => {
    if (activeFilterPayload) {
      sessionStorage.setItem("activeFilterPayload", JSON.stringify(activeFilterPayload));
    }
  }, [activeFilterPayload]);

  // Initial Data & Recovery logic
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
        const json = await res.json();
        const cats = json.categories || [];
        setCategories(cats);

        // When returning via Back button (POP), restore filters if they exist
        if (navType === "POP") {
          const savedPayload = sessionStorage.getItem("activeFilterPayload");
          const savedFilterActive = sessionStorage.getItem("isFilterActive") === "true";
          if (savedPayload && savedFilterActive) {
            setActiveFilterPayload(JSON.parse(savedPayload));
            setIsFilterActive(true);
          } else if (sessionStorage.getItem("selectedCategoryName")) {
            setIsFilterActive(true);
          }
        } else if (selectedCategory) {
          // Fresh selection
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

  // Listen for fresh navigation from outside (Clicking Category on Home)
  useEffect(() => {
    if (location.state?.category?.categoryName && navType !== "POP") {
      const newCat = location.state.category.categoryName;
      setSelectedCategory(newCat);
      setSelectedSubCategories([]);
      setCurrentPage(1);
      setActiveFilterPayload(null);
      setIsFilterActive(true);

      // Clear session for fresh navigation
      sessionStorage.removeItem("activeFilterPayload");
      sessionStorage.removeItem("currentPage");
    }
  }, [location.state, navType]);

  // Unified Fetching Effect
  useEffect(() => {
    if (categories.length === 0) return;

    // Robust matching of category name to ID
    const catId = categories.find(
      (c) => c.categoryName?.trim().toLowerCase() === selectedCategory?.trim().toLowerCase()
    )?.id;

    const performFetch = async () => {
      try {
        setFilterLoading(true);
        let url = `${import.meta.env.VITE_API_URL}/search/product`;
        let payload: any = {
          categoryId: catId || undefined,
          page: currentPage,
          limit: 12,
        };

        // Use filter endpoint if payload is active
        if (isFilterActive && activeFilterPayload) {
          url = `${import.meta.env.VITE_API_URL}/search/filter`;
          payload = { ...activeFilterPayload, page: currentPage };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        setFilteredProducts(json?.products || []);
        if (json?.filterValues) setFilterValues(json.filterValues);

        setMeta({
          totalPages: json?.meta?.totalPages || 1,
          total: json?.meta?.total || 0,
          page: json?.meta?.page || currentPage,
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFilterLoading(false);
      }
    };

    performFetch();
  }, [currentPage, isFilterActive, activeFilterPayload, selectedCategory, categories]);

  // UI Derived States
  const groupedResults = useMemo(() => {
    const visibleProducts = selectedSubCategories.length > 0
      ? filteredProducts.filter((p) => selectedSubCategories.includes(p.subCategory?.subCategoryName))
      : filteredProducts;

    return visibleProducts.reduce((acc: Record<string, any[]>, product) => {
      const catName = product.category?.categoryName || "Industrial Equipment";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(product);
      return acc;
    }, {});
  }, [filteredProducts, selectedSubCategories]);

  const availableSubCategories = useMemo(() => {
    const subs = filteredProducts.map((p) => p.subCategory?.subCategoryName).filter(Boolean);
    return [...new Set(subs)] as string[];
  }, [filteredProducts]);

  const currentCategoryId = useMemo(
    () => categories.find((c) => c.categoryName?.trim().toLowerCase() === selectedCategory?.trim().toLowerCase())?.id,
    [categories, selectedCategory]
  );

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922]">
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
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
                    setActiveFilterPayload(null);
                    sessionStorage.clear();
                  }}
                  className="text-xs text-[#163859] font-bold hover:underline"
                >
                  CLEAR ALL
                </button>
              </div>

              <div className="space-y-6">
                <FilterGroup
                  title="Categories"
                  type="radio"
                  items={categories.map((c) => c.categoryName)}
                  selected={selectedCategory}
                  onChange={(val: any) => {
                    setSelectedCategory(val);
                    setSelectedSubCategories([]);
                    setCurrentPage(1);
                    setActiveFilterPayload(null);
                    setIsFilterActive(true);
                  }}
                />

                {availableSubCategories.length > 0 && (
                  <FilterGroup
                    title="Sub-Categories"
                    type="checkbox"
                    items={availableSubCategories}
                    selected={selectedSubCategories}
                    onChange={(val: string) => {
                      setSelectedSubCategories((prev) =>
                        prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
                      );
                    }}
                  />
                )}

                <GeneratorFilterCard
                  filters={filterValues}
                  loading={filterLoading}
                  categoryId={currentCategoryId}
                  setIsFilterActive={setIsFilterActive}
                  setCurrentPage={setCurrentPage}
                  setActiveFilterPayload={setActiveFilterPayload}
                  activeFilterPayload={activeFilterPayload}
                />
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {filterLoading && filteredProducts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 6].map((i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <p className="text-muted-foreground">No products found for this selection.</p>
                <Button variant="link" onClick={() => { setIsFilterActive(false); setSelectedCategory(null); sessionStorage.clear(); }}>
                  Reset View
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedResults).map(([catName, products]: [string, any[]]) => (
                  <div key={catName} className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <h2 className="text-2xl font-black text-[#163859] italic uppercase">{catName}</h2>
                      <span className="text-xs font-bold text-muted-foreground">{products.length} Items</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                  </div>
                ))}

                {meta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="text-white font-bold rounded-full bg-[#163859] h-3 w-3 p-5 hover:bg-[#163859]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-bold">Page {currentPage} of {meta.totalPages}</span>
                    <Button
                      disabled={currentPage === meta.totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="text-white font-bold rounded-full bg-[#163859] h-3 w-3 p-5 hover:bg-[#163859]"
                    >
                      <ChevronRight className="h-4 w-4" />
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
    const compareData = JSON.parse(localStorage.getItem("compare") || '{"productIds": [], "product": [], "productCategories": []}');
    const { productIds, productCategories, product: compareProducts } = compareData;

    if (productIds.includes(product.id)) {
      toast.warning("This product is already in your comparison list.");
      return;
    }
    if (productIds.length >= 3) {
      toast.error("You can only compare up to 3 products at a time.");
      return;
    }
    if (productCategories.length > 0 && productCategories[0] !== product.category?.categoryName) {
      toast.warning("Please select products from the same category to compare.");
      return;
    }

    const updatedData = {
      productIds: [...productIds, product.id],
      productCategories: [...productCategories, product.category?.categoryName],
      product: [...compareProducts, product],
      products: [...(compareData.products || []), { id: product.id, modelName: product.modelName }],
    };

    localStorage.setItem("compare", JSON.stringify(updatedData));
    window.dispatchEvent(new Event("compareUpdated"));
    toast.success(`${product.modelName} added to comparison`);
  };

  const getImageUrl = (path?: string) => path ? `${import.meta.env.VITE_API_URL}/${path}` : "/placeholder.png";

  return (
    <div className="group bg-white dark:bg-[#182129] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 flex flex-col">
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        {product.files?.filter((f: any) => f.mimeType?.startsWith("image")).slice(0, 1).map((image: any) => (
          <img key={image.id} src={getImageUrl(image.url)} alt={product.modelName} className="h-full w-full object-cover" />
        ))}
        {!product.files?.some((f: any) => f.mimeType?.startsWith("image")) && (
          <img src="/placeholder.png" alt="No image available" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#163859] dark:text-blue-400 uppercase">{product.category?.categoryName}</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-1 line-clamp-2 uppercase italic">{product.modelName}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
          {product.group && Object.values(product.group)[0] ? (
            (Object.values(product.group)[0] as any).slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="border-l-2 border-gray-100 pl-2">
                <p className="text-gray-400 text-[9px] uppercase font-bold">{item.fieldName}</p>
                <p className="font-bold text-xs text-slate-700 truncate">{item.value || "-"}</p>
              </div>
            ))
          ) : <p className="col-span-2 text-gray-400 text-xs italic">Specifications pending...</p>}
        </div>
        <div className="flex flex-col gap-2 mt-auto pt-4 border-t">
          <Button asChild className="w-full bg-[#163859] hover:bg-[#163859]/90 text-white font-bold h-11">
            <NavLink to={`/product/${product.id}`}>VIEW DETAILS</NavLink>
          </Button>
          <Button variant="outline" onClick={handleCompare} className="w-full flex items-center gap-2 h-11 font-semibold">
            <ArrowLeftRight className="h-4 w-4" />
            COMPARE
          </Button>
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, items, selected, onChange, type = "checkbox" }: any) => (
  <div className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
    <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-gray-400">{title}</h4>
    <div className="space-y-3">
      {items.map((item: string) => (
        <label key={item} className="flex items-center gap-3 cursor-pointer group">
          <input
            type={type}
            name={title}
            checked={Array.isArray(selected) ? selected.includes(item) : selected === item}
            onChange={() => onChange(item)}
            className="w-4 h-4 border-gray-300 text-[#163859] focus:ring-[#163859]"
          />
          <span className={`text-sm font-medium transition-colors ${(Array.isArray(selected) ? selected.includes(item) : selected === item)
              ? "text-[#163859] font-bold"
              : "text-gray-600 group-hover:text-[#163859]"
            }`}>{item}</span>
        </label>
      ))}
    </div>
  </div>
);

export default Products;
