import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 10;

const ProductTableSkeleton = () => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead>PRODUCT NAME</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: ROWS }).map((_, i) => (
            <TableRow key={i} className="border-border">
              {/* Product name + image */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>

              {/* Description */}
              <TableCell>
                <Skeleton className="h-4 w-[280px]" />
              </TableCell>

              {/* Category badge */}
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </>
  );
};

export default ProductTableSkeleton;
