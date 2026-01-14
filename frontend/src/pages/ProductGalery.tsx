/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
// Assuming you are using shadcn/ui carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ProductGallery({ product }: { product: any }) {
  // 1. Filter only images from the files array
  const imageFiles =
    product?.files?.filter((file: any) => file.mimeType.startsWith("image/")) ||
    [];

  // 2. State to track which image is currently featured
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Set default image to the first one available when product loads
  useEffect(() => {
    if (imageFiles.length > 0) {
      setActiveImage(imageFiles[0].url);
    }
  }, [product]);

  if (imageFiles.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 container justify-self-center items-center">
      {/* MAIN IMAGE DISPLAY */}
      <div className="aspect-square w-full h-72 overflow-hidden rounded-xl border bg-muted">
        {activeImage && (
          <img
            src={`${import.meta.env.VITE_API_URL}/${activeImage}`}
            alt={product.modelName}
            className="w-full h-full object-cover transition-all duration-300"
          />
        )}
      </div>

      {/* CAROUSEL - Only show if more than 1 image */}
      {imageFiles.length > 1 && (
        <div className="px-10 relative container bg-slate-50">
          <Carousel className="w-full max-w-xs mx-auto container">
            <CarouselContent className="-ml-2">
              {imageFiles.map((file: any) => (
                <CarouselItem
                  key={file.id}
                  className="pl-2 basis-1/4"
                  onClick={() => setActiveImage(file.url)}
                >
                  <div
                    className={`cursor-pointer overflow-hidden rounded-md border-2 aspect-square transition-all ${
                      activeImage === file.url
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${file.url}`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-8" />
            <CarouselNext className="-right-8" />
          </Carousel>
        </div>
      )}
    </div>
  );
}
