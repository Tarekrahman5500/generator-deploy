import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export const AdminTableSkeleton = () => {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                    {/* Email */}
                    <TableCell className="px-6 py-4">
                        <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    {/* Phone */}
                    <TableCell className="px-6 py-4">
                        <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    {/* User Name */}
                    <TableCell className="px-6 py-4">
                        <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    {/* Role */}
                    <TableCell className="px-6 py-4">
                        <Skeleton className="h-6 w-[80px] rounded-full" />
                    </TableCell>
                    {/* Created At */}
                    <TableCell className="px-6 py-4">
                        <Skeleton className="h-4 w-[90px]" />
                    </TableCell>
                    {/* Updated At */}
                    <TableCell className="px-6 py-4">
                        <Skeleton className="h-4 w-[90px]" />
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};

