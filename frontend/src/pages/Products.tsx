/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

import { SkeletonCard } from "@/components/Skeleton/SkeletonLoading";
import { useParams } from "react-router-dom";
// Interfaces for your API data
interface File {
  url: string;
}

interface CategoryFile {
  id: string;
  file: File;
}

export interface Category {
  id: string;
  categoryId: string;
  type: string;
  categoryName: string;
  loadCapacityKg: number;
  maxLiftHeightM: GLfloat;
  mastType: string;
  powerSource: string;
  tireType: string;
  turningRadiusM: number;
  description: string;
  categoryFiles: CategoryFile[];
}

export interface CategoryResponse {
  statusCode: number;
  categories: Category[];
}
const Products = () => {
  const [data, setData] = useState<CategoryResponse>({
    statusCode: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  // const categories = [
  //   {
  //     id: "diesel-generators",
  //     title: "Diesel Generating Sets",
  //     description:
  //       "Reliable and robust power solutions for continuous and standby applications.",
  //     image: heavyMachineryImg,
  //   },
  //   {
  //     id: "compressors",
  //     title: "Compressors",
  //     description:
  //       "High-performance compressed air systems for a wide range of industrial uses.",
  //     image: automationImg,
  //   },
  //   {
  //     id: "ups",
  //     title: "UPS",
  //     description:
  //       "Uninterruptible power supplies to protect your critical operations from outages.",
  //     image: precisionToolsImg,
  //   },
  //   {
  //     id: "tower-lights",
  //     title: "Tower Lights",
  //     description:
  //       "Portable and powerful lighting solutions for construction sites and outdoor events.",
  //     image: heavyMachineryImg,
  //   },
  //   {
  //     id: "distributors-panel",
  //     title: "Distributors Panel",
  //     description:
  //       "Efficient and safe power distribution and control panels for any setup.",
  //     image: automationImg,
  //   },
  //   {
  //     id: "ats",
  //     title: "ATS",
  //     description:
  //       "Automatic Transfer Switches for seamless switching between power sources.",
  //     image: precisionToolsImg,
  //   },
  //   {
  //     id: "forklifts",
  //     title: "Forklifts",
  //     description:
  //       "Versatile and durable material handling and lifting equipment for warehouses.",
  //     image: heavyMachineryImg,
  //   },
  // ];
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/category/products/${id}`
        );
        const json = await res.json();
        console.log(json);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories: Category[] = json.data.map((category: any) => ({
          id: category.id || "",
          categoryId: category.categoryId,
          categoryName: category.modelName || "",
          loadCapacityKg: category.loadCapacityKg || "",
          type: category?.type || "",
          turningRadiusM: category.turningRadiusM,
          categoryFiles: (category.fileRelations || []).map((fileObj: any) => ({
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

      <section className="py-20 bg-secondary/30">
        <div className="container px-6">
          <div className="mb-12">
            <h1 className="text-5xl font-heading font-bold mb-4">
              Explore Our Industrial Equipment Categories
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Find the right solutions for your power, lighting, and material
              handling needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? // Show 6 skeletons while loading
                Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : data.categories.map((category) => (
                  <Card
                    key={category.id}
                    className="overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={`https://volumes-commission-continues-supervision.trycloudflare.com/${category.categoryFiles[0].file.url}`}
                        alt={category.categoryName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <CardContent className="p-6">
                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-4">
                        {category.categoryName}
                      </h3>

                      {/* 2-Column Specs */}
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                        {/* Column 1 */}
                        <div>
                          <p className="text-muted-foreground">Model Name</p>
                          <p className="font-semibold">
                            {category.categoryName}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Load Capacity</p>
                          <p className="font-semibold">
                            {category.loadCapacityKg}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-semibold">{category.type}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">
                            Turning Radius
                          </p>
                          <p className="font-semibold">
                            {category.turningRadiusM}
                          </p>
                        </div>
                      </div>

                      {/* Button */}
                      <Button
                        asChild
                        className="w-full mt-6 h-11 text-base font-semibold bg-accent hover:bg-accent rounded-lg"
                      >
                        <NavLink to={`/product/${category.categoryId}`}>
                          View Details
                        </NavLink>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
