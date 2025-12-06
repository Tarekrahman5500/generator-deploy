import { NavLink } from "@/components/NavLink";
import { Factory, Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Factory className="h-6 w-6" />
              <span className="font-heading font-bold text-xl">IndusTech</span>
            </div>
            <p className="text-sm text-navy-foreground/80">
              Providing innovative industrial solutions to power the world's
              leading industries.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
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
            <ul className="space-y-2 text-sm">
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
              <li>
                <a
                  href="/login"
                  className="text-navy-foreground/80 hover:text-navy-foreground transition-colors border-solid bg-accent px-4 py-2 rounded-sm mt-1"
                >
                  Corporate
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-navy-foreground/20">
          <p className="text-sm text-navy-foreground/80 mb-4 md:mb-0">
            © 2024 Marexis All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-navy-foreground/80 hover:text-navy-foreground transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
