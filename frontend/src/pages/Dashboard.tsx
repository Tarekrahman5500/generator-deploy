/* eslint-disable @typescript-eslint/no-explicit-any */

import { secureStorage } from "@/security/SecureStorage";
import {
  Package,
  Image as ImageIcon,
  Trash2,
  Plus,
  Upload,
  LogOut,
  List,
  Eye,
  Edit,
  Menu,
  X,
  Clipboard,
  Boxes,
  BookText,
} from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted"
        }`
      }
      onClick={() => setMobileMenuOpen(false)}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
  const accessToken = secureStorage.get("accessToken");
  const userName = secureStorage.get("userInfo") || "";
  const navigate = useNavigate();
  const formattedName = userName.charAt(0).toUpperCase();
  const handleLogout = async () => {
    if (!accessToken) {
      toast.error("No user logged in", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Logout failed", {
          style: {
            background: "#ff0000", // your custom red
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
          },
        });
        return;
      }

      secureStorage.clear();
      toast.success("Logged out successfully!", {
        style: {
          background: "#326e12", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!", {
        style: {
          background: "#ff0000", // your custom red
          color: "#fff",
          borderRadius: "10px",
          padding: "12px 16px",
        },
      });
    }
  };
  return (
    <div className="flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 bg-background border-r border-border flex-col h-screen sticky top-0">
        <div className="p-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
              <NavLink to="/" className="block">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-primary-foreground"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </NavLink>
            </div>
            <div>
              <NavLink to="/dashboard" className="block">
                <h2 className="font-xl font-bold text-foreground">Marexis</h2>
                <p className="text-sm text-muted-foreground">Admin Panel</p>
              </NavLink>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground px-4 py-2">
            CATEGORY
          </p>
          {navItem({
            to: "/dashboard/add-category",
            icon: Plus,
            label: "Add Category",
          })}
          {navItem({
            to: "/dashboard/view-category",
            icon: Eye,
            label: "View Categories",
          })}

          <p className="text-xs font-semibold text-muted-foreground px-4 py-2 pt-4">
            ADD PRODUCTS
          </p>
          {navItem({
            to: "/dashboard/add-groups",
            icon: Boxes,
            label: "Add Groups",
          })}
          {navItem({
            to: "/dashboard/view-products",
            icon: List,
            label: "View Products",
          })}

          <p className="text-xs font-semibold text-muted-foreground px-4 py-2 pt-4">
            MEDIA
          </p>
          {navItem({
            to: "/dashboard/backgrounds",
            icon: ImageIcon,
            label: "Backgrounds",
          })}
          <p className="text-xs font-semibold text-muted-foreground px-4 py-2 pt-4">
            Contact Form
          </p>
          {navItem({
            to: "/dashboard/contact-form",
            icon: Clipboard,
            label: "Contact",
          })}

          {navItem({
            to: "/dashboard/get-quote",
            icon: BookText,
            label: "Get Quote",
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* OVERLAY */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* SIDEBAR */}
        <div
          className={`fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex flex-col
      transition-transform duration-300 ease-in-out
      ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
    `}
        >
          {/* TOP HEADER */}
          <div className="p-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="w-5 h-5 text-primary-foreground"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-foreground text-md">
                  Marexis
                </h3>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* NAV CONTENT */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground px-4 py-2">
              CATEGORY
            </p>
            {navItem({
              to: "/dashboard/add-category",
              icon: Plus,
              label: "Add Category",
            })}
            {navItem({
              to: "/dashboard/view-category",
              icon: Eye,
              label: "View Categories",
            })}

            <p className="text-xs font-semibold text-muted-foreground px-4 py-2 pt-4">
              PRODUCTS
            </p>
            {navItem({
              to: "/dashboard/add-product",
              icon: Package,
              label: "Add Product",
            })}
            {navItem({
              to: "/dashboard/view-products",
              icon: List,
              label: "View Products",
            })}

            <p className="text-xs font-semibold text-muted-foreground px-4 py-2 pt-4">
              MEDIA
            </p>
            {navItem({
              to: "/dashboard/backgrounds",
              icon: ImageIcon,
              label: "Backgrounds",
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1 p-2">
        <header className="bg-background border-b border-border px-6 md:px-6 p-2 flex items-center justify-between sticky top-0 z-40 mb-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm p-2">
                {formattedName}
              </span>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
