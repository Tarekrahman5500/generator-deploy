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
import { ProductMediaUpload } from "@/components/ProductMediaUpload";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [formData, setFormData] = useState({
    subject: "Your Subject",
    body: "The message you want to send!",
  });
  const handleOpenModal = (req: any) => {
    setSelectedReq(req);
    setIsModalOpen(true);
  };
  const fetchData = async () => {
    const accessToken = await secureStorage.getValidToken();
    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/contact-form?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
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

  const handleReplySubmit = async () => {
    if (!selectedReq) return;
    const accessToken = await secureStorage.getValidToken();
    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contact-form/reply`,
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
        },
      );

      if (response.ok) {
        toast.success("Reply sent successfully!");
        setIsModalOpen(false);
        fetchData();
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      toast.error("Error sending reply");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);
  const handleCancel = () => {
    setIsModalOpen(false);
    toast.error("Form Cleared!", {
      style: {
        background: "#ff0000", // your custom red
        color: "#fff",
        borderRadius: "10px",
        padding: "12px 16px",
      },
    });
  };
  const handleDelete = async (id: string) => {
    try {
      const accessToken = await secureStorage.getValidToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/contact-form/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        toast.success("Message deleted successfully");
        // Optional: Refresh your data list here
        fetchData();
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Contact Form Submissions</h1>
      <p className="text-gray-600 mb-6">
        View and manage all customer inquiries from the contact form.
      </p>

      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100  hover:bg-gray-100 rounded-tl-2xl rounded-tr-2xl">
                <TableHead>Full Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telephone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Replied</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <ContactTableSkeleton />
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
                      <TooltipTrigger>
                        <TableCell className="max-w-xs truncate">
                          {row.message}
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent>{row.message}</TooltipContent>
                    </Tooltip>
                    <TableCell>
                      {row.isReplied ? (
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
                      <div className="flex items-center gap-2">
                        {/* REPLY BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-[#163859] text-[#163859] hover:bg-[#163859] hover:text-white"
                          onClick={() => handleOpenModal(row)}
                          disabled={row.isReplied}
                          title={row.isReplied ? "Replied" : "Reply"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {/* DELETE BUTTON */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
              <Label>Client Message</Label>
              <p className="text-sm text-muted-foreground border p-2 rounded-md bg-gray-50 max-w-md">
                {selectedReq?.message}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Reply</Label>
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
