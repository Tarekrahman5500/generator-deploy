import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProductDetailsSkeleton = () => {
  return (
    <section className="pb-20">
      <div className="container px-6">
        {/* Image + Info */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="rounded-xl overflow-hidden">
            <Skeleton className="w-full aspect-[4/3]" />
          </div>

          {/* Info */}
          <div>
            {/* Title */}
            <Skeleton className="h-10 w-3/4 mb-2" />

            {/* Category */}
            <Skeleton className="h-4 w-1/3 mb-4" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>

            {/* Features */}
            <div className="space-y-3 mt-6">
              <Skeleton className="h-6 w-1/4 mb-2" />

              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <AccordionItem
                key={i}
                value={`skeleton-${i}`}
                className="border-border"
              >
                <AccordionTrigger className="hover:no-underline border-b-2">
                  <Skeleton className="h-5 w-1/3" />
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-0">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className="grid grid-cols-2 py-3 border-b border-border last:border-b-0"
                      >
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Button */}
          <Skeleton className="h-12 w-full mt-8 rounded-lg" />
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsSkeleton;
