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
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ViewProducts from "./pages/ViewProducts";
import ContactForm from "./pages/ContactForm";
import ProductsAdd from "./pages/ProductsAdd";
import Compare from "./pages/Compare";
import FloatingCompareButton from "./components/FloatingCompareButton";
import InfoRequestsTable from "./pages/GetQuote";
import LoginForm from "./pages/IndexLogoin";
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

  // Hide UI for dashboard routes
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/dashboard");
  const hideLogin = location.pathname.startsWith("/login");

  //const hideFloatingCompare = location.pathname.startsWith("/dashboard");
  const isLoggedIn = localStorage.getItem("userIn") === "true";
  if (!isLoggedIn) {
    return <LoginForm />;
  }
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
          <Route path="/" element={<LoginForm />} />

          <Route path="/home" element={<Index />} />

          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
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
