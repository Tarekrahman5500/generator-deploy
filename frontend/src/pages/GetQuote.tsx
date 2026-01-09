/* eslint-disable @typescript-eslint/no-explicit-any */
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

import ProductTableSkeleton from "@/components/Skeleton/AdminProductSkeleton";
import GetQuoteTableSkeleton from "@/components/Skeleton/GetQuoteTableSkeleton";
import { secureStorage } from "@/security/SecureStorage";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ProductMediaUpload,
  UploadedFile,
} from "@/components/ProductMediaUpload";
import { DocFile } from "./AddProducts";
import { DocumentsUpload } from "@/components/DocumentsUpload";

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
  isReplied: boolean;
  product: Product;
  createdAt: string;
}

export const InfoRequestsTable = () => {
  const [requests, setRequests] = useState<InfoRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    perPage: number;
    totalPages: number;
  } | null>(null);

  const fetchRequests = async () => {
    const accessToken = await secureStorage.getValidToken();
    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contact-form/info-request?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch info requests");

      const json = await res.json();

      // ✅ CORRECT PATH
      setRequests(json.data || []);
      setMeta(json.meta || null);
    } catch (err) {
      console.error(err);
      toast.success("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [formData, setFormData] = useState({
    subject: "Your Subject",
    body: "The message you want to send!",
  });
  const [docFiles, setDocFiles] = useState<DocFile[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);

  const handleOpenModal = (req: any) => {
    setSelectedReq(req);
    setIsModalOpen(true);
  };
  const handleReplySubmit = async () => {
    if (!selectedReq) return;
    const accessToken = await secureStorage.getValidToken();
    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contact-form/reply/info-request`,
        {
          // Adjust base URL as needed
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...formData,
            parentId: selectedReq.id,
          }),
        }
      );

      if (response.ok) {
        toast.success("Reply sent successfully!");
        setIsModalOpen(false);
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      toast.error("Error sending reply");
    } finally {
      setSubmitting(false);
    }
  };
  const uploadImage = async (fileObj: UploadedFile) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", fileObj.file);
    const accessToken = await secureStorage.getValidToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${import.meta.env.VITE_API_URL}/file/image`);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);

        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, progress: percent } : f
          )
        );
      }
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      const backendId = res?.response?.id;

      if (backendId) {
        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? { ...f, status: "complete", backendId, progress: 100 }
              : f
          )
        );

        setFileIds((prev) => [...prev, backendId]);
      }

      setIsUploading(false);
    };

    xhr.onerror = () => {
      setMediaFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f))
      );
      setIsUploading(false);
    };

    xhr.send(formData);
  };
  const removeFile = (id: string) => {
    const file = mediaFiles.find((f) => f.id === id);

    if (file?.backendId) {
      setFileIds((prev) => prev.filter((fid) => fid !== file.backendId));
    }

    setMediaFiles((prev) => prev.filter((f) => f.id !== id));
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setMediaFiles([]);
    setDocFiles([]);
    toast.error("Form Cleared!", {
      style: {
        background: "#ff0000", // your custom red
        color: "#fff",
        borderRadius: "10px",
        padding: "12px 16px",
      },
    });
  };
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Info Requests</h2>
      <ScrollArea className="max-h-[70vh] border rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="rounded-2xl">
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Replied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <GetQuoteTableSkeleton />
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
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
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-400/15">
                      {req.product.modelName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {req.isReplied ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white border-none">
                        Replied
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleOpenModal(req)}
                      // Simply pass the boolean directly
                      disabled={req.isReplied}
                    >
                      {req.isReplied ? "Replied" : "Reply"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <div>
        {meta && meta.page >= 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
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
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="min-w-max">
            <AlertDialogHeader>
              <DialogTitle>Reply to {selectedReq?.fullName}</DialogTitle>
            </AlertDialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Message Body</Label>
                <Textarea
                  id="body"
                  rows={5}
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <ProductMediaUpload
                files={mediaFiles}
                onFilesChange={setMediaFiles}
                onUpload={uploadImage}
                onRemove={removeFile}
              />

              <DocumentsUpload files={docFiles} onFilesChange={setDocFiles} />
            </div>
            <AlertDialogFooter>
              <Button
                onClick={() => handleCancel()}
                className="bg-inherit hover:bg-transparent text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReplySubmit}
                disabled={submitting}
                className="bg-[#163859] hover:bg-[#163859]"
              >
                {submitting ? "Sending..." : "Send Reply"}
              </Button>
            </AlertDialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default InfoRequestsTable;
