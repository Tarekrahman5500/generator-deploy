import { NavLink } from "@/components/NavLink";
import { Factory } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Category } from "@/pages/Products";

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const cached = sessionStorage.getItem("cachedCategories");
    if (cached) {
      try {
        const parsedCategories = JSON.parse(cached);
        setCategories(parsedCategories.slice(0, 3));
      } catch (error) {
        console.error("Error parsing cached categories in Footer:", error);
      }
    }
  }, []);

  return (
    <footer className="bg-[#163859] text-white ">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4  gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Factory className="h-6 w-6" />
              <span className="font-heading font-bold text-xl">Marexis</span>
            </div>
            <p className="text-sm text-navy-foreground/80">
              Marexis Italy S.r.l. operates in the field of energy and technical
              infrastructure solutions, supporting industrial and infrastructure
              applications in both domestic and international markets.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id} className="flex flex-col gap-1">

                    <Link
                      to="/products"
                      state={{ category: category }}
                      className="text-navy-foreground/60 hover:text-white transition-colors text-sm"
                    >
                      <span className="text-navy-foreground/80 hover:text-navy-foreground transition-colors">{category.categoryName}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <NavLink
                      to="/products"
                      className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                    >
                      Heavy Machinery
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/products"
                      className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                    >
                      Automation & Robotics
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/products"
                      className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                    >
                      Precision Tools
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink
                  to="/about"
                  className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                >
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/services"
                  className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                >
                  Services
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm mt-3">
              <li>
                <a
                  href="#"
                  className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li className="my-2"></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center pt-8 border-t border-navy-foreground/20 m-auto">
          <p className="text-sm text-navy-foreground/80 mb-4 md:mb-0">
            © {new Date().getFullYear()} Marexis All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
