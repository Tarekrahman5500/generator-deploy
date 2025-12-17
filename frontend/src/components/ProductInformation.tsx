import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductInformationProps {
  productName: string;
  productModel: string;
  description: string;
  onProductNameChange: (value: string) => void;
  onProductModelChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function ProductInformation({
  productName,
  productModel,
  description,
  onProductNameChange,
  onProductModelChange,
  onDescriptionChange,
}: ProductInformationProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          Product Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="productModel">
            Product Model <span className="text-destructive">*</span>
          </Label>
          <Input
            id="productModel"
            placeholder="e.g. DG-5000-X Series"
            value={productModel}
            onChange={(e) => onProductModelChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Enter key features, usage instructions, or physical condition details..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[140px] resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
}
