/* eslint-disable @typescript-eslint/no-explicit-any */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Quote from "./pages/Quote";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./security/SecureRoute";
import AddCategory from "./pages/AddCategory";
import ViewCategory from "./pages/ViewCategory";
import AddProducts from "./pages/AddProducts";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ViewProducts from "./pages/ViewProducts";
import ContactForm from "./pages/ContactForm";
import ProductsAdd from "./pages/ProductsAdd";
import Compare from "./pages/Compare";
import FloatingCompareButton from "./components/FloatingCompareButton";
import InfoRequestsTable from "./pages/GetQuote";
import { AdministratorsTable } from "./pages/AdministratorList";
import { ImageManagement } from "./pages/Cms";
import { BackgroundManagement } from "./pages/BackgroundImageManagement";
import { secureStorage } from "./security/SecureStorage";
import EmailConfig from "./pages/EmailComponent";
const queryClient = new QueryClient();
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
const App = () => {
  const location = useLocation();
  const [cmsData, setCmsData] = useState<any>(null);
  const [loadingCms, setLoadingCms] = useState(true);
  const accessToken = secureStorage.get("accessToken");

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/background`);
        const data = await res.json();
        setCmsData(data.result || {});
      } catch (error) {
        console.error("Failed to fetch CMS data", error);
      } finally {
        setLoadingCms(false);
      }
    };

    fetchCmsData();
  }, []);
  // Hide UI for dashboard routes
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname.startsWith("/dashboard");
  const hideLogin = location.pathname.startsWith("/login");

  //const hideFloatingCompare = location.pathname.startsWith("/dashboard");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollToTop />
        {/* Navbar */}
        {!hideNavbar && !hideLogin && <Navbar />}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Index data={cmsData?.["Hero"] || []} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route
            path="/services"
            element={
              <Services
                data={cmsData?.["Services"] || []}
                serviceHero={cmsData?.["Service Main"] || []}
              />
            }
          />
          <Route
            path="/about"
            element={<About data={cmsData?.["About"] || []} />}
          />
          <Route
            path="/contact"
            element={<Contact data={cmsData?.["Contact"] || []} />}
          />
          <Route path="/quote" element={<Quote />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AddCategory />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="view-category" element={<ViewCategory />} />
            <Route path="add-product" element={<AddProducts />} />
            <Route path="add-groups" element={<ProductsAdd />} />
            <Route path="view-products" element={<ViewProducts />} />
            <Route path="contact-form" element={<ContactForm />} />
            <Route path="get-quote" element={<InfoRequestsTable />} />
            <Route path="get-admin-list" element={<AdministratorsTable />} />
            <Route path="cms-management" element={<BackgroundManagement />} />
            <Route path="email-config" element={<EmailConfig />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* 🌍 GLOBAL FLOATING COMPARE BUTTON */}
        {/* {!hideFloatingCompare && <FloatingCompareButton />} */}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
