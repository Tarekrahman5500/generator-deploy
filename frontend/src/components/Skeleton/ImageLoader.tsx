import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
const ImageLoader = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md">
      {/* SHADCN Skeleton Placeholder */}
      {!loaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-md">
          <div className="w-full h-full animate-[shimmer_2s_infinite] bg-[linear-gradient(110deg,#ececec_8%,#f5f5f5_18%,#ececec_33%)] bg-[length:200%_100%]" />
        </Skeleton>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 
        ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
      />
    </div>
  );
};

export default ImageLoader;
