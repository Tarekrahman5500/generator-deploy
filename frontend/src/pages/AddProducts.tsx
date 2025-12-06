/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AppWindowIcon,
  CodeIcon,
  FileText,
  ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "react-router-dom";
function InputField({ label, value, onChange }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
const AddProducts = () => {
  const location = useLocation();
  const receivedCategory = location.state?.category || "";
  console.log(receivedCategory);
  const sanitized = receivedCategory?.categoryName?.replace(/\s+/g, "");

  const [activeTab, setActiveTab] = useState(sanitized);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [product, setProduct] = useState({
    type: receivedCategory.categoryName,
    categoryId: receivedCategory.id,
    description: "",
    modelName: "",
    powerOutputKva: "",
    powerOutputKw: "",
    frequencyHz: "",
    voltageMin: "",
    voltageMax: "",
    voltageUnit: "V",
    fuelTankCapacityLiters: "",
    fuelConsumptionLPerHr: "",
    noiseLevelDb: "",
    engineMode: "",
    cylinders: "",
    displacementCc: "",
    aspiration: "",
    alternatorBrand: "",
    alternatorModel: "",
    alternatorInsulationClass: "",
    length: "",
    width: "",
    height: "",
    weightKg: "",
    fileIds: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const updateField = (key: string, value: any) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image MIME types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG & PNG files are allowed!");
      return;
    }

    setUploadedFile(file);
    uploadImage(file); // Upload automatically
  };
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/file/image`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      updateField("fileIds", [...product.fileIds, result.response.id]);
      toast.success("Image Uploaded Successfully");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);

    const base64 = await toBase64(file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/file/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, base64 }),
      });

      const data = await res.json();

      if (data?.response?.id) {
        updateField("fileIds", [...product.fileIds, data.response.id]);
        toast.success("PDF uploaded successfully!");
      }
    } catch (err) {
      toast.error("PDF upload failed");
    }
  };
  const saveProduct = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Product saved successfully!");
      setProduct({
        type: "",
        categoryId: "",
        description: "",
        modelName: "",
        powerOutputKva: "",
        powerOutputKw: "",
        frequencyHz: "",
        voltageMin: "",
        voltageMax: "",
        voltageUnit: "V",
        fuelTankCapacityLiters: "",
        fuelConsumptionLPerHr: "",
        noiseLevelDb: "",
        engineMode: "",
        cylinders: "",
        displacementCc: "",
        aspiration: "",
        alternatorBrand: "",
        alternatorModel: "",
        alternatorInsulationClass: "",
        length: "",
        width: "",
        height: "",
        weightKg: "",
        fileIds: [],
      });
      // Clear uploaded files
      setImageFile(null);
      setPdfFile(null);
    } else {
      toast.error(data.message || "Failed to save");
      setProduct({
        type: "",
        categoryId: "",
        description: "",
        modelName: "",
        powerOutputKva: "",
        powerOutputKw: "",
        frequencyHz: "",
        voltageMin: "",
        voltageMax: "",
        voltageUnit: "V",
        fuelTankCapacityLiters: "",
        fuelConsumptionLPerHr: "",
        noiseLevelDb: "",
        engineMode: "",
        cylinders: "",
        displacementCc: "",
        aspiration: "",
        alternatorBrand: "",
        alternatorModel: "",
        alternatorInsulationClass: "",
        length: "",
        width: "",
        height: "",
        weightKg: "",
        fileIds: [],
      });
      // Clear uploaded files
      setImageFile(null);
      setPdfFile(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl">Add Product</h1>
      <div className="flex min-w-full flex-col gap-1">
        <Tabs
          defaultValue={activeTab ? activeTab : "DieselGenerator"}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full justify-between">
            <TabsTrigger value="DieselGenerator">Diesel Generator</TabsTrigger>
            <TabsTrigger value="Compressor">Compressor</TabsTrigger>
            <TabsTrigger value="TowerLight">Tower Light</TabsTrigger>
            <TabsTrigger value="AutomaticTransferSwitch">
              Automatic Transfer Switch
            </TabsTrigger>
            <TabsTrigger value="DistributorPanel">
              Distributor Panel
            </TabsTrigger>
            <TabsTrigger value="Forklift">Forklift</TabsTrigger>
            <TabsTrigger value="UPS">UPS</TabsTrigger>
          </TabsList>
          <TabsContent value="DieselGenerator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-full">
              {/* LEFT FORM CARD */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Diesel Generator Details</CardTitle>
                    <CardDescription>
                      Fill out all product specifications
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid grid-cols-2 gap-4">
                    {/* Model Name */}
                    <InputField
                      label="Model Name"
                      value={product.modelName}
                      onChange={(v: string) => updateField("modelName", v)}
                    />

                    {/* Power Output kVA (integer) */}
                    <InputField
                      label="Power Output (kVA)"
                      value={product.powerOutputKva}
                      onChange={(v: string) =>
                        updateField("powerOutputKva", parseInt(v) || 0)
                      }
                    />

                    {/* Power Output kW */}
                    <InputField
                      label="Power Output (kW)"
                      value={product.powerOutputKw}
                      onChange={(v: string) =>
                        updateField("powerOutputKw", parseInt(v) || 0)
                      }
                    />

                    {/* Frequency */}
                    <InputField
                      label="Frequency (Hz)"
                      value={product.frequencyHz}
                      onChange={(v: string) =>
                        updateField("frequencyHz", parseInt(v) || 0)
                      }
                    />

                    {/* Voltage Min */}
                    <InputField
                      label="Voltage Min"
                      value={product.voltageMin}
                      onChange={(v: string) =>
                        updateField("voltageMin", parseInt(v) || 0)
                      }
                    />

                    {/* Voltage Max */}
                    <InputField
                      label="Voltage Max"
                      value={product.voltageMax}
                      onChange={(v: string) =>
                        updateField("voltageMax", parseInt(v) || 0)
                      }
                    />

                    {/* Fuel Tank Capacity */}
                    <InputField
                      label="Fuel Tank Capacity (Liters)"
                      value={product.fuelTankCapacityLiters}
                      onChange={(v: string) =>
                        updateField("fuelTankCapacityLiters", parseInt(v) || 0)
                      }
                    />

                    {/* Fuel Consumption */}
                    <InputField
                      label="Fuel Consumption (L/hr)"
                      value={product.fuelConsumptionLPerHr}
                      onChange={(v: string) =>
                        updateField("fuelConsumptionLPerHr", parseInt(v) || 0)
                      }
                    />

                    {/* Noise Level */}
                    <InputField
                      label="Noise Level (dB)"
                      value={product.noiseLevelDb}
                      onChange={(v: string) =>
                        updateField("noiseLevelDb", parseInt(v) || 0)
                      }
                    />

                    {/* Engine Mode */}
                    <InputField
                      label="Engine Mode"
                      value={product.engineMode}
                      onChange={(v: string) => updateField("engineMode", v)}
                    />

                    {/* Cylinders */}
                    <InputField
                      label="Cylinders"
                      value={product.cylinders}
                      onChange={(v: string) =>
                        updateField("cylinders", parseInt(v) || 0)
                      }
                    />

                    {/* Displacement */}
                    <InputField
                      label="Displacement (cc)"
                      value={product.displacementCc}
                      onChange={(v: string) =>
                        updateField("displacementCc", parseInt(v) || 0)
                      }
                    />

                    {/* Aspiration */}
                    <InputField
                      label="Aspiration"
                      value={product.aspiration}
                      onChange={(v: string) => updateField("aspiration", v)}
                    />

                    {/* Alternator Brand */}
                    <InputField
                      label="Alternator Brand"
                      value={product.alternatorBrand}
                      onChange={(v: string) =>
                        updateField("alternatorBrand", v)
                      }
                    />

                    {/* Alternator Model */}
                    <InputField
                      label="Alternator Model"
                      value={product.alternatorModel}
                      onChange={(v: string) =>
                        updateField("alternatorModel", v)
                      }
                    />

                    {/* Insulation Class */}
                    <InputField
                      label="Alternator Insulation Class"
                      value={product.alternatorInsulationClass}
                      onChange={(v: string) =>
                        updateField("alternatorInsulationClass", v)
                      }
                    />

                    {/* Length */}
                    <InputField
                      label="Length (mm)"
                      value={product.length}
                      onChange={(v: string) =>
                        updateField("length", parseInt(v) || 0)
                      }
                    />

                    {/* Width */}
                    <InputField
                      label="Width (mm)"
                      value={product.width}
                      onChange={(v: string) =>
                        updateField("width", parseInt(v) || 0)
                      }
                    />

                    {/* Height */}
                    <InputField
                      label="Height (mm)"
                      value={product.height}
                      onChange={(v: string) =>
                        updateField("height", parseInt(v) || 0)
                      }
                    />

                    {/* Weight */}
                    <InputField
                      label="Weight (kg)"
                      value={product.weightKg}
                      onChange={(v: string) =>
                        updateField("weightKg", parseInt(v) || 0)
                      }
                    />

                    {/* Description - Full Width */}
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        className="mt-1"
                        value={product.description}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={saveProduct}
                      className="bg-accent hover:bg-accent"
                    >
                      Save Product
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* RIGHT SIDE UPLOADS */}
              <div className="space-y-6">
                <div className="bg-background rounded-xl border border-border p-4 space-y-4">
                  <Label>Category Image</Label>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <p className="text-foreground font-medium">
                        Drag & drop your image here
                      </p>
                      <p className="text-sm text-muted-foreground">or</p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      Browse Image
                    </Button>
                  </div>

                  {imageFile && (
                    <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {imageFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(imageFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setImageFile(null)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="bg-background rounded-xl border border-border p-4 space-y-4 mt-2">
                  <Label>Product PDF (Brochure / Specs)</Label>

                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfSelect}
                  />

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <p className="text-foreground font-medium">
                        Upload product PDF
                      </p>
                      <p className="text-sm text-muted-foreground">or</p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => pdfInputRef.current?.click()}
                    >
                      Browse PDF
                    </Button>
                  </div>

                  {pdfFile && (
                    <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {pdfFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(pdfFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPdfFile(null)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Compressor">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="TowerLight">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="AutomaticTransferSwitch">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="DistributorPanel">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="Forklift">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="UPS">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-current">Current password</Label>
                  <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-new">New password</Label>
                  <Input id="tabs-demo-new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddProducts;
