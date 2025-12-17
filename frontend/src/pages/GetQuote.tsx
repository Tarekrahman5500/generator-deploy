import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import ProductTableSkeleton from "@/components/Skeleton/AdminProductSkeleton";
import GetQuoteTableSkeleton from "@/components/Skeleton/GetQuoteTableSkeleton";

interface Product {
  id: string;
  modelName: string;
  description: string;
}

interface InfoRequest {
  id: string;
  fullName: string;
  email: string;
  telephone: string;
  country: string;
  product: Product;
  createdAt: string;
}

export const InfoRequestsTable = () => {
  const [requests, setRequests] = useState<InfoRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/contact-form/info-request`
      );
      if (!res.ok) throw new Error("Failed to fetch info requests");
      const data = await res.json();
      setRequests(data.allInfoRequests.data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load info requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Info Requests</h2>
      <ScrollArea className="max-h-[70vh] border rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Country</TableHead>
              {/* <TableHead>Product</TableHead> */}
              <TableHead>Requested At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  <GetQuoteTableSkeleton />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No info requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/50">
                  <TableCell className="font-bold">{req.fullName}</TableCell>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>{req.telephone}</TableCell>
                  <TableCell>{req.country}</TableCell>
                  {/* <TableCell>
                    <Badge variant="secondary" className="bg-green-400/15">
                      {req.product.modelName}
                    </Badge>
                  </TableCell> */}
                  <TableCell>
                    {new Date(req.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
export default InfoRequestsTable;
