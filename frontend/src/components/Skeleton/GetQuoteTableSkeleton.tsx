import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 6;

const GetQuoteTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: ROWS }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-32 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-44 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default GetQuoteTableSkeleton;
