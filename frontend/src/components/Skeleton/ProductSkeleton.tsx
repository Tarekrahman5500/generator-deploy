import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden rounded-xl">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Skeleton */}
      <CardContent className="p-6">
        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Category */}
        <Skeleton className="h-4 w-1/2 mb-4" />

        {/* Group values (2x2) */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        {/* Button */}
        <Skeleton className="h-11 w-full mt-6 rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
