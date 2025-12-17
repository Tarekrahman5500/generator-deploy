/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ContactTableSkeleton from "@/components/Skeleton/ContactFormSkeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const ContactForm = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    perPage: number;
    totalPages: number;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contact-form?page=${page}&limit=${limit}`
      );

      if (!res.ok) throw new Error("Failed to load data");

      const json = await res.json();

      // ✅ UPDATED RESPONSE HANDLING
      setData(json.data || []);
      setMeta(json.meta || null);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Contact Form Submissions</h1>
      <p className="text-gray-600 mb-6">
        View and manage all customer inquiries from the contact form.
      </p>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Full Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telephone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <ContactTableSkeleton />
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No contact submissions found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold">
                      {row.fullName}
                    </TableCell>
                    <TableCell>{row.company}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.telephone}</TableCell>
                    <TableCell>{row.country}</TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TableCell className="max-w-xs truncate">
                          {row.message}
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent>{row.message}</TooltipContent>
                    </Tooltip>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ✅ PAGINATION */}
      {meta && meta.totalPages >= 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="bg-blue-600 p-1 w-8 h-8 rounded-sm text-white text-center">
              {" "}
              {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
