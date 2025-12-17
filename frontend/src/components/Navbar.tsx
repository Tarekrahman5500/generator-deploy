/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import logo from "@/assets/meraxis.png";
import { useEffect, useState } from "react";
import { GitCompare, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FloatingCompareButton from "./FloatingCompareButton";
import { Link, useNavigate } from "react-router-dom";
const Navbar = () => {
  const [open, setOpen] = useState(false);
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

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={logo} className="h-22 w-32" />
          </NavLink>

          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
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
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link to={"/compare"}>
                <>
                  <GitCompare />
                </>{" "}
                Compare
                {products.length > 0 && (
                  <span className=" w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">
                    {products.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
            >
              <NavLink to="/login" className="bg-inherit">
                Login
              </NavLink>
            </Button>

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
                    to="/"
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

                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                    <Button asChild size="sm" className="md:inline-flex">
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
                      className="md:inline-flex"
                    >
                      <NavLink to="/login" className="bg-inherit">
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
