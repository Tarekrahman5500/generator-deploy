/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import productImg from "@/assets/product-genset.jpg";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Category, CategoryResponse } from "./Products";

const ProductDetail = () => {
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const transformProductToSpecifications = (product: any) => {
    return Object.entries(product).map(([key, value]) => {
      // If it's an array of files, join URLs
      if (Array.isArray(value) && value.length > 0 && value[0]?.file?.url) {
        return {
          label: key,
          value: value.map((f: any) => f.file.url).join(", "),
        };
      }

      return { label: key, value: value ?? "-" };
    });
  };

  // Example usage inside fetch
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/category/products/${id}`
        );
        const json = await res.json();

        if (json.data) {
          const specifications = transformProductToSpecifications(json.data[0]);
          console.log(specifications);
          setSpecifications(specifications);
        }
      } catch (error) {
        console.error(error);
        setSpecifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  const features = [
    {
      title: "High-Output Engine",
      description:
        "Equipped with a turbocharged, aftercooled diesel engine for superior power density and transient response.",
    },
    {
      title: "Advanced Control System",
      description:
        "Features a digital control panel for easy monitoring, diagnostics, and seamless integration with ATS systems.",
    },
    {
      title: "Sound-Attenuated Enclosure",
      description:
        "Weather-protective, sound-dampening steel enclosure for quiet operation and durability in harsh environments.",
    },
    {
      title: "Fuel Efficient",
      description:
        "Optimized fuel consumption system to reduce operational costs without compromising on performance.",
    },
  ];

  // const specifications = [
  //   { label: "Model", value: "GenSet Model X-5000" },
  //   { label: "Standby Power Rating", value: "500 kVA / 400 kW" },
  //   { label: "Prime Power Rating", value: "450 kVA / 360 kW" },
  //   { label: "Voltage", value: "400/230 V, 3 Phase, 50 Hz" },
  //   { label: "Engine Manufacturer", value: "Industrial Power Pro" },
  //   { label: "Fuel Tank Capacity", value: "800 Liters" },
  //   { label: "Dimensions (L x W x H)", value: "3500mm x 1200mm x 1800mm" },
  //   { label: "Weight", value: "3200 kg" },
  // ];
  console.log(specifications);
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container px-6 py-8">
        <nav className="text-sm text-muted-foreground mb-8">
          <NavLink to="/products" className="hover:text-foreground">
            Products
          </NavLink>
          {" > "}
          <NavLink to="/products" className="hover:text-foreground">
            Diesel Generating Sets
          </NavLink>
          {" > "}
          <span className="text-foreground">GenSet Model X-5000</span>
        </nav>
      </div>

      <section className="pb-20">
        <div className="container px-6">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="rounded-xl overflow-hidden">
              <img
                src={productImg}
                alt="GenSet Model X-5000"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-4xl font-heading font-bold mb-4">
                GenSet Model X-5000
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                The GenSet Model X-5000 is a state-of-the-art diesel generator
                designed for maximum reliability and efficiency. It provides a
                robust power solution for a wide range of applications, from
                emergency standby for data centers and hospitals to prime power
                for remote industrial sites. Engineered for durability and
                performance, it ensures your operations never stop.
              </p>

              <h2 className="text-2xl font-heading font-bold mb-6">
                Key Features
              </h2>
              <div className="grid gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild size="lg">
                <NavLink to="/contact">Request a Quote</NavLink>
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-heading font-bold mb-8">
              Technical Specifications
            </h2>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="font-medium">{spec.label}</div>
                    <div className="text-muted-foreground">{spec.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
