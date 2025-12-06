/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-industrial.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { Category, CategoryResponse } from "./Products";
import { SkeletonCard } from "@/components/Skeleton/SkeletonLoading";

const Index = () => {
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
  const [data, setData] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/category`);
        const json = await res.json();
        console.log(json);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories: Category[] = json.categories.map((category: any) => ({
          id: category.id || "",
          categoryName: category.categoryName || "",
          description: category.description || "",
          categoryFiles: (category.categoryFiles || []).map((fileObj: any) => ({
            id: fileObj.id || "",
            file: {
              url: fileObj.file?.url || "",
            },
          })),
        }));

        setData({
          statusCode: res.status,
          categories,
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        setData({
          statusCode: 500,
          categories: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Industrial manufacturing facility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/60" />
        </div>

        <div className="container relative z-10 px-6">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Precision Engineering for a Modern World
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Discover our cutting-edge solutions designed for reliability,
              performance, and unparalleled industrial efficiency.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <NavLink to="/products">Explore Our Solutions</NavLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories */}
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

          <div className="grid md:grid-cols-3 gap-8">
            {loading
              ? // Show 6 skeletons while loading
                Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : data.categories.map((category) => (
                  <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${
                          category.categoryFiles[0].file.url
                        }`}
                        alt="Heavy Machinery"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-heading font-bold mb-3">
                        {category.categoryName}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {category.description}
                      </p>
                      <Button
                        asChild
                        variant="link"
                        className="p-0 h-auto text-primary"
                      >
                        <NavLink to={`/products/${category.id}`}>
                          View More <ArrowRight className="ml-1 h-4 w-4" />
                        </NavLink>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality has earned us the trust of partners
              worldwide. Here's what they have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-navy-foreground">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto rounded-2xl bg-navy-foreground/5 backdrop-blur p-12 text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">
              25+ Years of Engineering Excellence
            </h2>
            <p className="text-lg text-navy-foreground/90 mb-8 max-w-2xl mx-auto">
              For over two decades, IndusTech has been at the forefront of
              industrial innovation. Our mission is to empower businesses with
              technology that drives progress and builds a better future.
              Partner with us to engineer your success.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
