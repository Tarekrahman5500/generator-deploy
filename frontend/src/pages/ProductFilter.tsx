/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Types
export type RangeFilter = {
  min: number;
  max: number;
  value: [number, number];
};

export type ValueFilter = {
  values: string[];
};

export type Filters = Record<string, RangeFilter | ValueFilter>;
type GeneratorFilterCardProps = {
  filters: any;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>; // Type for useState setter
  loading?: boolean;
  categoryId: string;
  subCategory: string[];
};

export default function GeneratorFilterCard({
  filters,
  loading = false,
  categoryId,
  setProducts,
  setIsFilterActive, // Add this prop
}: any) {
  // 1. Local states for all filter types
  const [selectedValues, setSelectedValues] = useState<
    Record<string, string[]>
  >({});
  const [ranges, setRanges] = useState<Record<string, [number, number]>>({});

  // Initialize ranges if not set
  useEffect(() => {
    const initialRanges: any = {};
    Object.entries(filters).forEach(([key, value]: any) => {
      if (value.min !== undefined && value.max !== undefined) {
        initialRanges[key] = [value.min, value.max];
      }
    });
    setRanges(initialRanges);
  }, [filters]);

  const toggleValue = (key: string, value: string) => {
    setSelectedValues((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleApplyFilters = async () => {
    try {
      // 2. Construct the Request Body
      const requestBody: any = {
        // subCategoryId: subCategory,
        categoryId,
        filters: {},
        page: 1,
        limit: 10,
        sortBy: "modelName",
        sortOrder: "ASC",
      };

      Object.entries(filters).forEach(([key, schema]: any) => {
        // Handle Ranges (PRP and LTP)
        if (key === "prpRange") {
          requestBody.prpMin = ranges[key]?.[0] ?? schema.min;
          requestBody.prpMax = ranges[key]?.[1] ?? schema.max;
        } else if (key === "ltpRange") {
          requestBody.ltpMin = ranges[key]?.[0] ?? schema.min;
          requestBody.ltpMax = ranges[key]?.[1] ?? schema.max;
        }
        // Handle Dynamic Field IDs
        else if (schema.fieldId && selectedValues[key]?.length > 0) {
          // Assuming API takes the first selected value for a fieldId
          requestBody.filters[schema.fieldId] = selectedValues[key][0];
        }
        // Handle Standard values (like Model)
        else if (key === "Model" && selectedValues[key]?.length > 0) {
          requestBody.modelName = selectedValues[key][0];
        }
      });

      // 3. API Call
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/search/filter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data.statusCode === 200) {
        setProducts(data.products || []); // Set the response to parent state
        setIsFilterActive(true);
        toast.success("Filters applied!");
      }
    } catch (error) {
      toast.error("Failed to fetch filtered products");
    }
  };

  const renderRange = (label: string, key: string, schema: any) => (
    <div className="space-y-3 w-full">
      <h4 className="text-sm font-semibold uppercase text-muted-foreground">
        {label}
      </h4>
      <Slider
        value={ranges[key] || [schema.min, schema.max]}
        min={schema.min}
        max={schema.max}
        step={1}
        onValueChange={(val: [number, number]) =>
          setRanges((prev) => ({ ...prev, [key]: val }))
        }
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{ranges[key]?.[0] ?? schema.min} kVA</span>
        <span>{ranges[key]?.[1] ?? schema.max} kVA</span>
      </div>
    </div>
  );

  if (loading) return <Skeleton className="h-[400px] w-full" />;

  return (
    <Card className="border-none shadow-none w-full">
      <CardContent className="space-y-6 bg-white">
        {Object.entries(filters).map(([key, value]: any) => {
          // Dynamic Range Detection
          if (value.min !== undefined && value.max !== undefined) {
            return <div key={key}>{renderRange(key, key, value)}</div>;
          }

          // Dynamic Values/Field Detection
          if (value.values) {
            return (
              <div key={key} className="space-y-2">
                <h4 className="text-sm font-semibold uppercase text-muted-foreground">
                  {key}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {value.values.map((v: string) => {
                    const isSelected = selectedValues[key]?.includes(v);
                    return (
                      <Badge
                        key={v}
                        variant={isSelected ? "default" : "secondary"}
                        className={`cursor-pointer ${
                          isSelected ? "bg-[#163859]" : ""
                        }`}
                        onClick={() => toggleValue(key, v)}
                      >
                        {v}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          onClick={handleApplyFilters}
          className="w-full bg-[#163859] hover:bg-[#0d233a]"
        >
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => {
            setSelectedValues({});
            setRanges({});
          }}
        >
          Reset All
        </Button>
      </CardFooter>
    </Card>
  );
}
