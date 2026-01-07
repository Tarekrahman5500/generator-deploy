/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-industrial.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { SkeletonCard } from "@/components/Skeleton/SkeletonLoading";
import { Link } from "react-router-dom";
import heavyMachineryImg from "@/assets/category-heavy-machinery.jpg";
import automationImg from "@/assets/category-automation.jpg";
import precisionToolsImg from "@/assets/category-precision-tools.jpg";
import PageLoader from "./PageLoader";
import FloatingCompareButton from "@/components/FloatingCompareButton";
import { Category } from "./Products";
import ImageLoader from "@/components/Skeleton/ImageLoader";

const Index = ({ data }) => {
  const testimonials = [
    {
      text: "IndusTech's machinery revolutionized our production line. The reliability is unmatched, and their support team is always responsive. A true partner in our success.",
      author: "Jonathan Doe",
      role: "Operations Manager, AeroCorp",
    },
    {
      text: "The automation solutions we implemented from IndusTech increased our efficiency by 40%. It was a seamless integration process from start to finish.",
      author: "Samantha Rivera",
      role: "CEO, Buildright Construction",
    },
    {
      text: "From robotic tools to heavy equipment, the quality is consistent and world-class. IndusTech is our go-to supplier for all critical hardware.",
      author: "Michael Chen",
      role: "Lead Engineer, Quantum Dynamics",
    },
  ];

  const cmsContent = {
    "title": data[0]?.title,
    "description": data[0]?.description,
    "file": {
      "id": data[0]?.file?.id,
      "originalName": data[0]?.file?.url?.originalName,
      "url": data[0]?.file?.url,
    },
    "isVisible": data[0]?.isVisible,
  }
  const [loading, setLoading] = useState(true);
  const categoriesStatic = [
    {
      id: "diesel-generators",
      title: "Diesel Generator",
      description:
        "Reliable and robust power solutions for continuous and standby applications.",
      image: heavyMachineryImg,
    },
    {
      id: "compressors",
      title: "Compressor",
      description:
        "High-performance compressed air systems for a wide range of industrial uses.",
      image: automationImg,
    },
    {
      id: "ups",
      title: "UPS",
      description:
        "Uninterruptible power supplies to protect your critical operations from outages.",
      image: precisionToolsImg,
    },
    {
      id: "tower-lights",
      title: "Tower Light",
      description:
        "Portable and powerful lighting solutions for construction sites and outdoor events.",
      image: heavyMachineryImg,
    },
    {
      id: "distributors-panel",
      title: "Distributors Panel",
      description:
        "Efficient and safe power distribution and control panels for any setup.",
      image: automationImg,
    },
    {
      id: "ats",
      title: "ATS",
      description:
        "Automatic Transfer Switches for seamless switching between power sources.",
      image: precisionToolsImg,
    },
    {
      id: "forklifts",
      title: "Forklift",
      description:
        "Versatile and durable material handling and lifting equipment for warehouses.",
      image: heavyMachineryImg,
    },
  ];
  const [Error, setError] = useState(false);
  const CACHE_KEY = "cachedCategories";
  const cached = sessionStorage.getItem(CACHE_KEY);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);

      // Modern way: Check navigation type using PerformanceNavigationTiming
      const navigationEntry = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const isReloaded = navigationEntry?.type === "reload";

      // Optional fallback for older browsers (still works today but deprecated)
      // const isReloaded = isReloaded || performance.navigation?.type === performance.navigation.TYPE_RELOAD;

      // If reloaded, bypass cache
      const cached = isReloaded ? null : sessionStorage.getItem(CACHE_KEY);

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.VITE_API_URL}/${cmsContent.file.url
              }`}
            alt="Industrial manufacturing facility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/60" />
        </div>

        <div className="container relative z-10 px-6">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              {cmsContent.title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              {cmsContent.description}
              
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#163859] hover:bg-[#163859] text-accent-foreground"
            >
              <NavLink to="/products">Explore Our Solutions</NavLink>
            </Button>
          </div>
        </div>
      </section>
      <section className="py-20 bg-secondary/30">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Our Product Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Engineered for excellence, our products set the standard for
              quality and durability across all major industries.
            </p>
          </div>

          <div className="grid md:grid-cols-1  gap-4">
            <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
              {categories?.map((category) => (
                <Card
                  key={category.id}
                  className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {loading ? (
                      <PageLoader />
                    ) : (
                      <ImageLoader
                        src={`${import.meta.env.VITE_API_URL}/${category.categoryFiles[0].file.url
                          }`}
                        alt={category?.categoryName}
                      />
                    )}
                  </div>

                  <CardContent className="p-6 flex-1">
                    <h3 className="text-xl font-heading font-bold mb-2">
                      {category?.categoryName}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category?.description}
                    </p>
                  </CardContent>

                  <CardFooter className="flex gap-2 mt-auto">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#163859] font-semibold"
                    >
                      <Link to="/products" state={{ category: category }}>
                        View Products
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#163859] text-white">
        <div className="container px-6">
          {/* backdrop-blur works best when the background is slightly transparent, 
        using white/10 to make the box pop against the navy background */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-white/10 backdrop-blur-md p-12 text-center border border-white/10">
            <h2 className="text-4xl font-heading font-bold mb-4">
              25+ Years of Engineering Excellence
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              For over two decades, IndusTech has been at the forefront of
              industrial innovation. Our mission is to empower businesses with
              technology that drives progress and builds a better future.
              Partner with us to engineer your success.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#163859] text-white font-bold"
            >
              <NavLink to="/contact">Contact Our Experts</NavLink>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
