/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const FloatingCompareButton = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const updateProducts = () => {
    const compareData = JSON.parse(
      localStorage.getItem("compare") || '{"products": []}'
    );
    setProducts(compareData.products || []);
  };

  useEffect(() => {
    updateProducts();
    window.addEventListener("compareUpdated", updateProducts);
    return () => window.removeEventListener("compareUpdated", updateProducts);
  }, []);

  const handleRemove = (id: string) => {
    const compareData = JSON.parse(
      localStorage.getItem("compare") || '{"products": [], "productIds": []}'
    );

    const updatedProducts = compareData.products.filter(
      (p: any) => p.id !== id
    );

    const updatedProductIds = compareData.productIds.filter(
      (pid: string) => pid !== id
    );

    // 🔥 If nothing left → remove storage completely
    if (updatedProducts.length === 0) {
      localStorage.removeItem("compare");
      setProducts([]); // optional but good UX
      return;
    }

    // Otherwise update normally
    localStorage.setItem(
      "compare",
      JSON.stringify({
        ...compareData,
        products: updatedProducts,
        productIds: updatedProductIds,
      })
    );

    updateProducts();
  };

  const handleClearAll = () => {
    localStorage.removeItem("compare");
    setProducts([]);
    navigate("/compare");
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/6 md:right-6 md:left-auto z-50 mb-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* BUTTON */}
      <Link
        to={products.length > 1 ? "/compare" : "#"}
        onClick={(e) => products.length < 2 && e.preventDefault()}
        className="relative inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg mb-16"
      >
        <>
          <GitCompare />
        </>{" "}
        Compare
        {products.length > 0 && (
          <span className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">
            {products.length}
          </span>
        )}
      </Link>

      {/* HOVER */}
      {hovered && products.length > 0 && (
        <div className="absolute bottom-12 right-0 w-64 bg-white shadow-lg rounded p-3 mb-16">
          <h4 className="font-bold mb-2">Products to Compare</h4>

          <ul className="max-h-40 overflow-auto space-y-1">
            {products.map((product: any) => (
              <li
                key={product.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="truncate">{product.modelName}</span>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleClearAll}
            className="mt-2 text-sm text-red-600 hover:underline w-full text-left"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingCompareButton;
