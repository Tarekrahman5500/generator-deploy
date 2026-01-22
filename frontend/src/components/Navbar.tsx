/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import logo from "@/assets/meraxis.png";
import { useEffect, useState } from "react";
import { GitCompare, Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FloatingCompareButton from "./FloatingCompareButton";
import { Link, useNavigate } from "react-router-dom";
import { secureStorage } from "@/security/SecureStorage";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import CustomTranslate from "./GoogleTranslator";
///search?q=titan
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const accessToken = secureStorage.get("accessToken");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const updateProducts = () => {
    const compareData = JSON.parse(
      localStorage.getItem("compare") || '{"products": []}',
    );
    setProducts(compareData.products || []);
  };
  const checkTokenValidity = async () => {
    const accessToken = secureStorage.get("accessToken");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-token`,
        {
          method: "POST", // Or POST depending on your API
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (data.isValid === false) {
        // Token is invalid or expired
        secureStorage.clear();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      // On network error, decide if you want to clear or keep (usually clear for security)
      secureStorage.clear();
      return false;
    }
  };

  const verifySync = async () => {
    const isValid = await checkTokenValidity();
    return isValid;
  };

  // Debounce the search query with 100ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 100);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    updateProducts();
    window.addEventListener("compareUpdated", updateProducts);
    return () => window.removeEventListener("compareUpdated", updateProducts);
  }, []);

  const handleRemove = (id: string) => {
    const compareData = JSON.parse(
      localStorage.getItem("compare") || '{"products": [], "productIds": []}',
    );

    const updatedProducts = compareData.products.filter(
      (p: any) => p.id !== id,
    );

    const updatedProductIds = compareData.productIds.filter(
      (pid: string) => pid !== id,
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
      }),
    );

    updateProducts();
  };
  const fetchSearchResults = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(query)}`,
      );

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSearchResults(value);
  };
  const handleResultClick = (result: any) => {
    setSearchQuery("");
    setSearchResults([]);
    const category = {
      categoryName: result.metadata.categoryName,
    };
    if (result.type === "category") {
      navigate("/products", {
        state: {
          category,
        },
      });
    }

    if (result.type === "product") {
      navigate(`/product/${result.id}`);
    } else if (result.type === "field") {
      navigate(`/product/${result.metadata.productId}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink
            to="/home"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={logo} className="h-22 w-32" />
          </NavLink>

          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/home"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-semibold"
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-semibold"
            >
              Products
            </NavLink>
            <NavLink
              to="/services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-semibold"
            >
              Services
            </NavLink>
            <NavLink
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-semibold"
            >
              About Us
            </NavLink>

            <NavLink
              to="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-semibold"
            >
              Contact
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <form className="hidden md:flex items-center relative">
              <div className="relative w-28 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pl-9 h-9"
                />

                {/* Dropdown */}
                {searchQuery.length >= 3 && (
                  <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
                    <CardContent className="p-2 max-h-64 overflow-y-auto">
                      {isLoading ? (
                        <div className="py-3 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition"
                            onClick={() => handleResultClick(result)}
                          >
                            {result?.type === "field" && (
                              <p className="text-sm font-medium">
                                Model: {result?.metadata?.productModel}
                              </p>
                            )}
                            <p className="text-sm font-medium">{result.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {result.type}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-3 text-center text-sm text-muted-foreground">
                          No match found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </form>
            <div className="hidden md:block">
              <CustomTranslate />
            </div>

            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex bg-[#163859] hover:bg-[#163859]"
            >
              <Link to={"/compare"}>
                <>
                  <GitCompare />
                </>{" "}
                Compare
                {products.length > 0 && (
                  <span className=" w-6 h-6 rounded-full bg-[#ffffff] hover:bg-[#ffffff] text-black flex items-center justify-center text-xs">
                    {products.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden md:inline-flex hover:bg-[#163859]"
            >
              <NavLink
                to={verifySync() ? "/dashboard" : "/login"}
                className="bg-inherit"
              >
                Login
              </NavLink>
            </Button>
            <form className="md:hidden flex items-center relative">
              <div className="relative w-28 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pl-9 h-9"
                />

                {/* Dropdown */}
                {searchQuery.length >= 3 && (
                  <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
                    <CardContent className="p-2 max-h-64 overflow-y-auto">
                      {isLoading ? (
                        <div className="py-3 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition"
                            onClick={() => handleResultClick(result)}
                          >
                            <p className="text-sm font-medium">
                              {result?.metadata?.productModel}
                            </p>
                            <p className="text-sm font-medium">{result.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {result.type}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-3 text-center text-sm text-muted-foreground">
                          No match found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </form>
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-6 mt-6">
                  <NavLink
                    to="/home"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeClassName="text-foreground font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/products"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeClassName="text-foreground font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Products
                  </NavLink>
                  <NavLink
                    to="/services"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeClassName="text-foreground font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Services
                  </NavLink>
                  <NavLink
                    to="/about"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeClassName="text-foreground font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    About Us
                  </NavLink>
                  <NavLink
                    to="/contact"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeClassName="text-foreground font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Contact
                  </NavLink>

                  <CustomTranslate />

                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                    <Button
                      asChild
                      size="sm"
                      className="md:inline-flex bg-[#163859] hover:bg-[#163859]"
                    >
                      <Link to={products.length > 0 ? "/compare" : "#"}>
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
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="md:inline-flex bg-[#163859] hover:bg-[#163859]"
                    >
                      <NavLink
                        to={accessToken ? "/dashboard" : "/login"}
                        className="bg-[#163859] hover:bg-[#163859] text-white"
                      >
                        Login
                      </NavLink>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
