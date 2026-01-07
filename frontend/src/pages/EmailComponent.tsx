import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { secureStorage } from "@/security/SecureStorage";

interface EmailCredential {
  id: string;
  apiKey: string;
  fromEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EmailConfig = () => {
  const [data, setData] = useState<EmailCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    apiKey: "",
    fromEmail: "",
    isActive: false,
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/email-credentials`; // Adjust based on your vite proxy or base URL
  const accessToken = secureStorage.get("accessToken");
  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Add/Edit Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });
      setIsOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ apiKey: "", fromEmail: "", isActive: false });
  };

  const handleEditClick = (item: EmailCredential) => {
    setEditingId(item.id);
    setFormData({
      apiKey: item.apiKey,
      fromEmail: item.fromEmail,
      isActive: item.isActive,
    });
    setIsOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between px-0">
          <div>
            <CardTitle className="text-2xl font-black">
              Email Credentials
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your API keys for outgoing emails.
            </p>
          </div>

          <Dialog
            open={isOpen}
            onOpenChange={(val) => {
              setIsOpen(val);
              if (!val) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#1A3E6E] hover:bg-[#1A3E6E]/90">
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Credential" : "Add New Credential"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">From Email</label>
                  <Input
                    placeholder="noreply@company.com"
                    value={formData.fromEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, fromEmail: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">API Key</label>
                  <Input
                    placeholder="re_..."
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, isActive: val })
                    }
                  />
                  <label className="text-sm font-medium">Mark as Active</label>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-[#1A3E6E]">
                    {editingId ? "Update Configuration" : "Save Configuration"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="px-0">
          <div className="rounded-md border bg-white dark:bg-slate-900">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Sender Email</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No credentials found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge
                          variant={item.isActive ? "default" : "secondary"}
                          className={
                            item.isActive
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : ""
                          }
                        >
                          {item.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.fromEmail}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span>
                            {showKeyId === item.id
                              ? item.apiKey
                              : "••••••••••••"}
                          </span>
                          <button
                            onClick={() =>
                              setShowKeyId(
                                showKeyId === item.id ? null : item.id
                              )
                            }
                          >
                            {showKeyId === item.id ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default EmailConfig;
