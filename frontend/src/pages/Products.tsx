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
import { useEffect, useState } from "react";
import { SkeletonCard } from "@/components/Skeleton/SkeletonLoading";
import { useLocation, useParams } from "react-router-dom";
import empty from "../assets/no-data-found.png";
import ImageLoader from "@/components/Skeleton/ImageLoader";
import ProductCardSkeleton from "@/components/Skeleton/ProductSkeleton";
import { CirclePlus } from "lucide-react";
import { toast } from "sonner";
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
}

export interface CategoryResponse {
  statusCode: number;
  categories: Category[];
}
const Products = () => {
  const location = useLocation();

  const filterCategoryName = location.state?.category?.categoryName;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [Error, setError] = useState(false);
  const CACHE_KEY = "cachedCategories";

  // Fetch categories once and cache
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);

      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setCategories(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
        const json = await res.json();

        const mappedCategories: Category[] = (json.categories || []).map(
          (cat: any) => ({
            id: cat.id,
            categoryName: cat.categoryName,
            description: cat.description,
            categoryFiles: (cat.categoryFiles || []).map((fileObj: any) => ({
              id: fileObj.id,
              file: { url: fileObj.file?.url || "" },
            })),
            products: Array.isArray(cat.products) ? cat.products : [],
          })
        );

        setCategories(mappedCategories);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(mappedCategories));
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  // Filter if a categoryName is passed via state
  const displayedCategories = filterCategoryName
    ? categories.filter((cat) => cat.categoryName === filterCategoryName)
    : categories;

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-secondary/30">
        <div className="container px-6">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold mb-4">
              Explore Our Industrial Equipment Categories
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Find the right solutions for your power, lighting, and material
              handling needs.
            </p>
          </div>
          {Error && (
            <div className="flex justify-center items-center">
              <img
                src={empty}
                alt="No data found"
                style={{ width: "50%", height: "50%" }}
              />
            </div>
          )}

          {!Error && loading ? (
            <SkeletonCard />
          ) : (
            displayedCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};
// Recursive renderer for any nested objects
const renderValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    return (
      <div className="ml-2 space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <strong>{k}:</strong> {renderValue(v)}
          </div>
        ))}
      </div>
    );
  }
  return value.toString();
};
// Component for each category section
const CategorySection = ({ category }: { category: Category }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category?.id) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/category/products?categoryId=${
            category.id
          }&page=1&limit=4`
        );
        const json = await res.json();
        setProducts(json?.category.products || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category.id]);

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-4">{category.categoryName}</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && <ProductCardSkeleton />}

        {!loading && products.length === 0 && (
          <img
            src={empty}
            style={{ width: "120%", height: "120%" }}
            className="max-w-full max-h-full"
          />
        )}

        {products.map((product, index) => {
          const groupKeys = Object.keys(product.group || {});
          const firstGroupKey = groupKeys[0];
          const groupValues = product.group?.[firstGroupKey] || [];

          return (
            <Card
              key={product.id || index}
              className="overflow-hidden hover:shadow-xl transition-all rounded-xl flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <ImageLoader
                  src={
                    product.files?.[0]?.url
                      ? `${import.meta.env.VITE_API_URL}/${
                          product.files[0].url
                        }`
                      : empty
                  }
                  alt={product.modelName || "Product"}
                />
              </div>

              {/* Header */}
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl line-clamp-2">
                  {product.modelName}
                </CardTitle>
                <CardDescription>
                  {product.category?.categoryName}
                </CardDescription>
              </CardHeader>

              {/* Content (flex-1 so footer stays bottom) */}
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {groupValues.slice(0, 4).map((item: any, i: number) => (
                    <div key={i}>
                      <p className="text-muted-foreground capitalize">
                        {item.fieldName}
                      </p>
                      <p className="font-semibold">{item.value || "-"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Footer ALWAYS at bottom */}
              <CardFooter className="flex flex-col gap-2">
                <Button
                  asChild
                  className="w-full h-11 text-base font-semibold bg-accent hover:bg-accent rounded-lg"
                >
                  <NavLink to={`/product/${product.id}`}>View Details</NavLink>
                </Button>

                <Button
                  asChild
                  className="w-full h-11 text-base font-semibold bg-transparent/30 hover:bg-transparent/30 rounded-lg text-black cursor-pointer"
                  onClick={() => {
                    const compareData = JSON.parse(
                      localStorage.getItem("compare") ||
                        '{"productIds": [],"product":[]}'
                    );
                    const productIds = compareData.productIds;
                    const compareProducts = compareData.product;
                    const storedCategories =
                      compareData.productCategories || [];

                    // Check duplicate
                    if (productIds.includes(product.id)) {
                      toast.warning("Already added", { duration: 3000 });
                      return;
                    }

                    // Check max 3
                    if (productIds.length >= 3) {
                      toast.warning(
                        "You can only compare 3 products at a time",
                        { duration: 3000 }
                      );
                      return;
                    }

                    // Check same category
                    if (
                      storedCategories.length > 0 &&
                      storedCategories[0] !== product.category?.categoryName
                    ) {
                      toast.warning(
                        "You can only compare products from the same category",
                        { duration: 3000 }
                      );
                      return;
                    }

                    // Add product
                    productIds.push(product.id);
                    storedCategories.push(product.category?.categoryName);
                    compareProducts.push(product);
                    localStorage.setItem(
                      "compare",
                      JSON.stringify({
                        productIds,
                        productCategories: storedCategories,
                        products: [
                          ...(compareData.products || []),
                          {
                            id: product.id,
                            modelName: product.modelName,
                          },
                        ],
                        product: compareProducts,
                      })
                    );

                    // Dispatch event to update floating button count
                    window.dispatchEvent(new Event("compareUpdated"));

                    // Show success toast
                    toast.success("Compare product added successfully", {
                      duration: 3000,
                    });
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <CirclePlus />
                    Compare
                  </span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
