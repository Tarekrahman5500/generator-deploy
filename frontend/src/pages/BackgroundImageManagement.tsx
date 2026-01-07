import React, { useState, useEffect, useRef } from "react";
import { Upload, Loader2, Save, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { secureStorage } from "@/security/SecureStorage";

// Define the structure of a single background record
interface BackgroundItem {
    id: string;
    section: string;
    title: string;
    description: string;
    file: {
        id: string;
        url: string;
    } | null;
    isUploading?: boolean;
}

// Define the structure of the API response
interface GroupedResult {
    [key: string]: BackgroundItem[];
}

export const BackgroundManagement = () => {
    const [groupedItems, setGroupedItems] = useState<GroupedResult>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const accessToken = secureStorage.get("accessToken");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTarget, setActiveTarget] = useState<{ section: string, index: number } | null>(null);

    // --- Fetch Data ---
    const fetchBackgrounds = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/background`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await res.json();
            // data.result is now the object { "About Us": [...], "Hero": [...] }
            setGroupedItems(data.result || {});
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBackgrounds(); }, []);

    // --- Remove File Logic ---
    const removeFile = async (fileId: string) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/file/${fileId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return true;
        } catch (error) {
            return false;
        }
    };

    // --- Handle Upload (Delete Old -> Upload New) ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeTarget) return;

        const { section, index } = activeTarget;
        const currentItem = groupedItems[section][index];

        // UI Loading state
        setGroupedItems(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) => i === index ? { ...item, isUploading: true } : item)
        }));

        // 1. Delete old file if exists
        if (currentItem.file?.id) {
            await removeFile(currentItem.file.id);
        }

        // 2. Upload new
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/file/image`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const result = await res.json();

            // 3. Update State
            setGroupedItems(prev => ({
                ...prev,
                [section]: prev[section].map((item, i) =>
                    i === index ? {
                        ...item,
                        file: { id: result.response.id, url: result.response.url },
                        isUploading: false
                    } : item
                )
            }));
            toast.success("Image uploaded. Ready to save.");
        } catch (error) {
            toast.error("Upload failed");
        }
    };
    const handleDeleteRecord = async (sectionName: string, id: string) => {
        // Simple browser confirmation, or you can use shadcn AlertDialog
        if (!window.confirm("Are you sure you want to delete this specific record? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/background/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                toast.success("Record deleted successfully");
                // Remove from local state
                setGroupedItems(prev => ({
                    ...prev,
                    [sectionName]: prev[sectionName].filter(item => item.id !== id)
                }));
            } else {
                toast.error("Failed to delete the record");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred during deletion");
        }
    };
    // --- Update (PATCH) Record ---
    const handleUpdate = async (section: string, index: number) => {
        const item = groupedItems[section][index];
        setIsSaving(item.id);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/background`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    id: item.id,
                    section: item.section,
                    title: item.title,
                    description: item.description,
                    fileId: item.file?.id || null
                }),
            });

            if (res.ok) toast.success("Updated successfully");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSaving(null);
        }
    };

    if (loading) return <div className="p-10 space-y-4"><Skeleton className="h-12 w-1/4" /><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="p-10 space-y-12 bg-background min-h-screen">
            <h1 className="text-4xl font-black tracking-tight">Background Management</h1>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            {Object.keys(groupedItems).map((sectionName) => (
                <div key={sectionName} className="space-y-6">
                    <div className="border-b border-border pb-2 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-[#163859] ">{sectionName}</h2>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                            {groupedItems[sectionName].length} Items
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedItems[sectionName].map((item, index) => (
                            <Card key={item.id} className="border-border bg-card flex flex-col shadow-sm group/card">
                                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-muted/30">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                        ID: {item.id.split('-')[0]}...
                                    </span>
                                    {/* DELETE ICON ADDED HERE */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        onClick={() => handleDeleteRecord(sectionName, item.id)}
                                        title="Delete Record"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </CardHeader>

                                <CardContent className="pt-6 space-y-4 flex-1">
                                    {/* Image Preview and remaining fields... */}
                                    {item?.file?.url ? <div
                                        className="aspect-video rounded-lg bg-muted border bg-cover bg-center relative group overflow-hidden"
                                        style={{ backgroundImage: item.file ? `url(${import.meta.env.VITE_API_URL}/${item.file.url})` : 'none' }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeFile(item.file.id)}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => { setActiveTarget({ section: sectionName, index }); fileInputRef.current?.click(); }}
                                            >
                                                {item.isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : "Change Image"}
                                            </Button>
                                        </div>
                                    </div> : ""}


                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-[10px] uppercase font-bold opacity-60">Title</Label>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => {
                                                    const next = { ...groupedItems };
                                                    next[sectionName][index].title = e.target.value;
                                                    setGroupedItems(next);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] uppercase font-bold opacity-60">Description</Label>
                                            <Textarea
                                                className="h-20 resize-none text-sm"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const next = { ...groupedItems };
                                                    next[sectionName][index].description = e.target.value;
                                                    setGroupedItems(next);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>

                                <div className="p-4 pt-0">
                                    <Button
                                        className="w-full gap-2 bg-[#163859] hover:bg-[#163859]"
                                        onClick={() => handleUpdate(sectionName, index)}
                                        disabled={isSaving === item.id || item.isUploading}
                                    >
                                        {isSaving === item.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                                        Save Changes
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};