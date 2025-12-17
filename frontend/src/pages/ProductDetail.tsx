/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Card } from "@/components/ui/card";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import productImg from "@/assets/product-genset.jpg";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, ChevronRight } from "lucide-react";
import ProductDetailsSkeleton from "@/components/Skeleton/ProductSkeletonDetails";
const features = [
  "Ultra-bright LED modules with 360° visibility",
  "IP65 rated water and dust resistant housing",
  "Modular slakable design for easy maintenance",
  "Pre-wired with M12 connector for quick installation",
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/product/${id}`
        );
        const json = await res.json();
        setProduct(json?.productDetails || null);
      } catch (error) {
        console.error("Failed to fetch product", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container px-6 py-20">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-6 py-20 text-center">Product not found</div>
    );
  }

  const imageUrl = product?.files?.[0]?.url
    ? `${import.meta.env.VITE_API_URL}/${product.files[0].url}`
    : productImg;

  const specificationGroups = product?.group
    ? Object.entries(product.group)
    : [];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <NavLink to="/products" className="hover:text-foreground">
            Products
          </NavLink>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">
            {product.category?.categoryName}
          </span>
        </nav>
      </div>

      {/* Product Content */}
      <section className="pb-20">
        <div className="container px-6">
          {/* Image + Info */}
          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <div className="rounded-xl overflow-hidden bg-muted/30">
              <img
                src={imageUrl}
                alt={product.modelName}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                {product.modelName}
              </h1>

              <p className="text-sm text-muted-foreground mb-4">
                {product.category?.categoryName}
              </p>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-3 mt-6">
                <h2 className="tex-2xl">Key Feature</h2>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="max-w-3xl">
            <Accordion
              type="single"
              collapsible
              defaultValue={specificationGroups[0]?.[0]}
              className="w-full"
            >
              {specificationGroups.map(([groupName, specs]: any) => (
                <AccordionItem
                  key={groupName}
                  value={groupName}
                  className="border-border"
                >
                  <AccordionTrigger className="text-base font-extrabold hover:no-underline border-b-2">
                    {groupName}
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-0">
                      {specs.map((spec: any, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 py-3 border-b border-border last:border-b-0"
                        >
                          <span className="font-medium text-foreground capitalize">
                            {spec.fieldName}
                          </span>
                          <span className="text-muted-foreground">
                            {spec.value || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button
              asChild
              size="lg"
              className="w-full mt-8 bg-accent hover:bg-accent"
            >
              <NavLink to="/quote" state={{ product: product }}>
                Request a Quote
              </NavLink>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
