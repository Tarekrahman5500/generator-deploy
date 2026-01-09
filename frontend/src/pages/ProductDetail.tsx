/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Card } from "@/components/ui/card";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import productImg from "@/assets/product-genset.jpg";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, ChevronRight } from "lucide-react";
import ProductDetailsSkeleton from "@/components/Skeleton/ProductSkeletonDetails";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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

  // Use state instead of useRef to ensure the element is "ready"
  const [brochureElement, setBrochureElement] = useState<HTMLDivElement | null>(
    null
  );

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

  const downloadBrochure = async () => {
    if (!brochureElement) {
      alert("Preparing brochure... please try again in a second.");
      return;
    }

    try {
      // html2canvas captures the text exactly as Google Translate has modified it
      const canvas = await html2canvas(brochureElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/jpg");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${product.modelName}_Technical_Data_Sheet.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

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
    <div className="min-h-screen relative">
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

              <div className="flex flex-col gap-3 mt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full mt-4 bg-[#163859] hover:bg-[#163859]"
                >
                  <NavLink to="/quote" state={{ product: product }}>
                    Request a Quote
                  </NavLink>
                </Button>

                {/* DOWNLOAD BUTTON */}
                {/* <Button
                  onClick={downloadBrochure}
                  variant="outline"
                  size="lg"
                  className="w-full border-[#163859] text-[#163859] font-bold"
                >
                  Download Brochure (PDF)
                </Button> */}
              </div>
            </div>
          </div>

          {/* Specifications Accordion */}
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
          </div>
        </div>
      </section>

      {/* --- HIDDEN BROCHURE TEMPLATE --- */}
      {/* We move this off-screen so the user can't see it, but Google Translate can find it */}
      <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
        <div
          ref={(el) => setBrochureElement(el)}
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "15mm",
            background: "white",
            color: "black",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Logo Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <img src="/logo.png" alt="MAREXIS" style={{ height: "50px" }} />
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#333",
                margin: 0,
              }}
            >
              TECHNICAL DATA SHEET
            </h1>
          </div>

          <h2
            style={{
              textAlign: "center",
              fontSize: "24px",
              color: "#163859",
              borderBottom: "2px solid #163859",
              paddingBottom: "10px",
              marginBottom: "30px",
            }}
          >
            MAREXIS {product.modelName}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Table Column 1 */}
            <div>
              {specificationGroups
                .slice(0, Math.ceil(specificationGroups.length / 2))
                .map(([groupName, specs]: any) => (
                  <div key={groupName} style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        background: "#163859",
                        color: "white",
                        padding: "6px 10px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {groupName}
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "11px",
                      }}
                    >
                      <tbody>
                        {specs.map((spec: any, idx: number) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #ddd" }}
                          >
                            <td
                              style={{
                                padding: "6px",
                                fontWeight: "bold",
                                width: "60%",
                              }}
                            >
                              {spec.fieldName}
                            </td>
                            <td style={{ padding: "6px" }}>
                              {spec.value || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>

            {/* Table Column 2 + Image */}
            <div>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Product"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              {specificationGroups
                .slice(Math.ceil(specificationGroups.length / 2))
                .map(([groupName, specs]: any) => (
                  <div key={groupName} style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        background: "#163859",
                        color: "white",
                        padding: "6px 10px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {groupName}
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "11px",
                      }}
                    >
                      <tbody>
                        {specs.map((spec: any, idx: number) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #ddd" }}
                          >
                            <td
                              style={{
                                padding: "6px",
                                fontWeight: "bold",
                                width: "60%",
                              }}
                            >
                              {spec.fieldName}
                            </td>
                            <td style={{ padding: "6px" }}>
                              {spec.value || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "20px",
              fontSize: "10px",
              color: "#777",
              borderTop: "1px solid #eee",
            }}
          >
            Note: Technical data are indicative and may change without notice.
            Dimensions and weight depend on configuration and are therefore TBD.
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
