import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, LockKeyhole, Edit2, Trash2, Loader2 } from "lucide-react";
import { secureStorage } from "@/security/SecureStorage";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AdminTableSkeleton } from "@/components/Skeleton/AdminListSkeleton";


interface Administrator {
    id: string,
    email: string;
    phone: string;
    userName: string;
    role: string;
    roleVariant?: "default" | "secondary" | "outline" | "destructive";
    createdAt: string;
    updatedAt: string;
}

export const AdministratorsTable = () => {
    const [administrators, setAdministrators] = useState<Administrator[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<Administrator & { password?: string }>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchAdmins = async () => {
        try {
            const accessToken = await secureStorage.getValidToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/administrator`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            console.log(json)
            // Assuming your API returns { admins: [...] }
            setAdministrators(json.admins || []);
        } catch (error) {
            console.error("Failed to fetch administrators:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleEditClick = (user: Administrator) => {
        setSelectedUser({ ...user, password: "" }); // Initialize with empty password
        setIsEditDialogOpen(true);
    };
    const validatePassword = (pass: string) => {
        if (!pass) return true; // Allowed to be blank to keep current
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        return regex.test(pass);
    };
    const closeAndResetModal = () => {
        setIsEditDialogOpen(false);
        setIsUpdating(false);
        setPasswordError(null);
        setSelectedUser({});
        setLoading(false)
    };
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedUser.password && !validatePassword(selectedUser.password)) {
            setPasswordError("Password must be at least 8 characters, include uppercase, lowercase, and a special character.");
            return;
        }
        const accessToken = await secureStorage.getValidToken();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/administrator`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    id: selectedUser.id, // Or however your API identifies the user
                    userName: selectedUser.userName,
                    phone: selectedUser.phone,
                    email: selectedUser.email,
                    password: selectedUser.password || undefined, // Only send if changed
                }),
            });

            if (res.ok) {
                setIsEditDialogOpen(false);
                fetchAdmins(); // Refresh list
                closeAndResetModal();
                setLoading(false);
                toast.success("Admin Info Updated Successfully", {
                    style: {
                        background: "#326e12", // your custom red
                        color: "#fff",
                        borderRadius: "10px",
                        padding: "12px 16px",
                    },
                });
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed Update Data", {
                style: {
                    background: "#ff0000", // your custom red
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "12px 16px",
                },
            });
        } finally {
            setIsUpdating(false);
        }
    };
    useEffect(() => {
        fetchAdmins();
    }, []);

    // Filter logic for search


    return (
        <div className="p-10 space-y-8 bg-background min-h-screen text-foreground">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-4xl font-black tracking-tight">Administrators</h1>
            </div>

            {/* Table Section */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="py-4 px-6 font-semibold">Email</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">Phone</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">User Name</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">Role</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">Created At</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">Updated At</TableHead>
                            <TableHead className="py-4 px-6 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <AdminTableSkeleton />
                        ) : (
                            administrators.map((user) => (
                                <TableRow key={user.email} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="px-6 py-4 font-medium">{user.email}</TableCell>
                                    <TableCell className="px-6 py-4 text-muted-foreground">{user.phone}</TableCell>
                                    <TableCell className="px-6 py-4 font-medium">{user.userName}</TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge variant={user.roleVariant || "default"} className="rounded-full px-3">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-muted-foreground">
                                        {new Date(user.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="hover:text-primary" title="Edit" onClick={() => handleEditClick(user)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <DialogTitle>Edit Administrator</DialogTitle>
                    </AlertDialogHeader>
                    <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">User Name</Label>
                            <Input
                                id="name"
                                value={selectedUser.userName || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, userName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={selectedUser.email || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={selectedUser.phone || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <p className="text-[10px] text-muted-foreground leading-tight">
                                (Must have: 1 Upper, 1 Lower, 1 Special Char, 8+ Chars. Leave blank to keep current)
                            </p>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className={passwordError ? "border-destructive focus-visible:ring-destructive" : ""}
                                value={selectedUser.password || ""}
                                onChange={(e) => {
                                    setSelectedUser({ ...selectedUser, password: e.target.value });
                                    if (passwordError) setPasswordError(null);
                                }}
                            />
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={closeAndResetModal}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};