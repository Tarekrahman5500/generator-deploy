/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import Footer from "@/components/Footer";
import productImg from "@/assets/product-genset.jpg";
import { toast } from "sonner";
import nodata from "@/assets/no-data.png";
import { useNavigate } from "react-router-dom";
const Compare = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const compareData = JSON.parse(
      localStorage.getItem("compare") || '{"productIds": [], "product": []}'
    );
    if (compareData.productIds.length === 0) return;

    setProducts(compareData.product);
  }, []);

  // Get all unique field names across all products
  const getAllFields = () => {
    const fieldMap = new Map<string, { groupKey: string; fieldName: string }>();
    products.forEach((product) => {
      if (product.group) {
        Object.keys(product.group).forEach((groupKey) => {
          product.group[groupKey].forEach((field: any) => {
            const key = `${groupKey}-${field.fieldName}`;
            if (!fieldMap.has(key)) {
              fieldMap.set(key, { groupKey, fieldName: field.fieldName });
            }
          });
        });
      }
    });
    return Array.from(fieldMap.values());
  };

  const getFieldValue = (product: any, groupKey: string, fieldName: string) => {
    if (!product.group || !product.group[groupKey]) return "-";
    const field = product.group[groupKey].find(
      (f: any) => f.fieldName === fieldName
    );
    return field?.value || "-";
  };

  const allFields = getAllFields();

  const handleClearCompare = () => {
    localStorage.removeItem("compare");
    setProducts([]);
    window.dispatchEvent(new Event("compareUpdated"));
    toast.success("Compare list cleared successfully", { duration: 3000 });
  };

  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    const compareData = {
      productIds: updatedProducts.map((p) => p.id),
      product: updatedProducts,
    };
    localStorage.setItem("compare", JSON.stringify(compareData));
    setProducts(updatedProducts);
    window.dispatchEvent(new Event("compareUpdated"));
    toast.success("Product removed from comparison", { duration: 2000 });
  };

  const handleAddProduct = (category?: any) => {
    navigate("/products", { state: { category: category } });
  };

  // Get category from first product (for add button context)
  const currentCategory = products[0]?.category || null;

  // Create array of 3 slots (filled products + empty slots)
  const slots = Array(3)
    .fill(null)
    .map((_, index) => products[index] || null);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="container px-4 md:px-6 py-8">
        <Button
          variant="ghost"
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Product Comparison
            </h1>
            <p className="text-muted-foreground">
              Compare specifications and features side by side.
            </p>
          </div>
          {products.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 self-start"
              onClick={handleClearCompare}
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <section className="pb-20">
        <div className="container px-4 md:px-6">
          {/* Product Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {slots.map((product, index) => (
              <div
                key={product?.id || `empty-${index}`}
                className="bg-background rounded-xl border border-border overflow-hidden"
              >
                {product ? (
                  /* Filled Product Card */
                  <div className="relative">
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="aspect-[4/3] bg-muted/30 overflow-hidden">
                      <img
                        src={
                          product.files?.[0]?.url
                            ? `${import.meta.env.VITE_API_URL}/${
                                product.files[0].url
                              }`
                            : "/placeholder.svg"
                        }
                        alt={product.modelName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 text-center border-t border-border">
                      <h3 className="font-bold text-lg truncate">
                        {product.modelName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {product.category?.categoryName ||
                          "Industrial Equipment"}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Empty Slot Card */
                  <button
                    onClick={() => handleAddProduct(currentCategory)}
                    className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-4 p-6 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                      <Plus className="h-8 w-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Add Product
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        Click to browse products
                      </p>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Specifications Table */}
          {products.length > 0 && (
            <div className="bg-background rounded-xl border border-border overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border bg-muted/20">
                <h2 className="font-bold text-lg">Specifications</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/10">
                      <th className="text-left p-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground w-1/4">
                        Feature
                      </th>
                      {slots.map((product, index) => (
                        <th
                          key={product?.id || `header-${index}`}
                          className="p-4 text-center text-sm font-semibold w-1/4"
                        >
                          {product?.modelName || "-"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Model Name Row */}
                    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">
                        Model Name
                      </td>
                      {slots.map((product, index) => (
                        <td
                          key={product?.id || `model-${index}`}
                          className="p-4 text-center text-muted-foreground"
                        >
                          {product?.modelName || "-"}
                        </td>
                      ))}
                    </tr>

                    {/* Dynamic Field Rows */}
                    {allFields.map(({ groupKey, fieldName }) => (
                      <tr
                        key={`${groupKey}-${fieldName}`}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4 font-medium text-foreground">
                          {fieldName}
                        </td>
                        {slots.map((product, index) => {
                          if (!product) {
                            return (
                              <td
                                key={`empty-${index}`}
                                className="p-4 text-center text-muted-foreground"
                              >
                                -
                              </td>
                            );
                          }
                          const value = getFieldValue(
                            product,
                            groupKey,
                            fieldName
                          );
                          const isCheck =
                            value.toLowerCase().includes("yes") ||
                            value.toLowerCase().includes("included") ||
                            value.includes("Years");

                          return (
                            <td
                              key={product.id}
                              className="p-4 text-center text-muted-foreground"
                            >
                              {isCheck ? (
                                <span className="inline-flex items-center justify-center gap-1.5 text-primary">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {value}
                                </span>
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State - When no products at all */}
          {products.length === 0 && (
            <div className="bg-background rounded-xl border border-border p-12 text-center mt-8">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Plus className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No Products to Compare
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add products to compare by visiting the product pages and
                  clicking the compare button.
                </p>
                <Button asChild className="bg-[#163859] hover:bg-[#163859]">
                  <NavLink to="/products">Browse Products</NavLink>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Compare;
