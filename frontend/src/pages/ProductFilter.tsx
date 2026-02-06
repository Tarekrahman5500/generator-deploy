/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function GeneratorFilterCard({
  filters,
  loading = false,
  categoryId,
  setIsFilterActive,
  setCurrentPage,
  setActiveFilterPayload,
  activeFilterPayload,
}: any) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
  const [ranges, setRanges] = useState<Record<string, [number, number]>>({});
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  const prevCategoryId = useRef(categoryId);

  // 1. Reset ONLY if categoryId actually changes to a DIFFERENT valid ID
  useEffect(() => {
    if (categoryId && prevCategoryId.current && categoryId !== prevCategoryId.current) {
      setSelectedValues({});
      setRanges({});
      sessionStorage.removeItem("activeFilterPayload");
    }
    prevCategoryId.current = categoryId;
  }, [categoryId]);

  // 2. Restore values from activeFilterPayload when filters or payload changes
  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) return;

    const newSelectedValues: Record<string, string[]> = {};
    const newRanges: Record<string, [number, number]> = {};

    // Build defaults from schema
    Object.values(filters).forEach((group: any) => {
      if (!group.values) return;
      Object.values(group.values).forEach((field: any) => {
        if (field.type === "range" && typeof field.min === "number" && typeof field.max === "number") {
          newRanges[field.fieldId] = [field.min, field.max];
        }
      });
    });

    // Override with active payload if available
    if (activeFilterPayload) {
      if (activeFilterPayload.modelNames) {
        newSelectedValues["model"] = activeFilterPayload.modelNames;
      }

      Object.values(filters).forEach((group: any) => {
        if (!group.values) return;
        Object.entries(group.values).forEach(([fieldName, field]: [string, any]) => {
          const payloadValue = activeFilterPayload.filters?.[field.fieldId];
          if (payloadValue === undefined) return;

          if (field.type === "range") {
            if (payloadValue.min !== undefined && payloadValue.max !== undefined) {
              newRanges[field.fieldId] = [payloadValue.min, payloadValue.max];
            }
          } else {
            const key = fieldName.toLowerCase() === "model" ? "model" : fieldName;
            // For model, we already handled it via modelNames root, but we sync here too for the UI
            if (key !== "model") {
              newSelectedValues[key] = [payloadValue];
            }
          }
        });
      });
    }

    setSelectedValues(newSelectedValues);
    setRanges((prev) => ({ ...prev, ...newRanges }));
  }, [filters, activeFilterPayload]);

  const toggleExpand = (fieldName: string) => {
    setExpandedFields((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const toggleValue = (fieldName: string, value: string) => {
    setSelectedValues((prev) => {
      const key = fieldName.toLowerCase() === "model" ? "model" : fieldName;
      const current = prev[key] || [];
      if (key === "model") {
        return current.includes(value)
          ? { ...prev, [key]: current.filter((v) => v !== value) }
          : { ...prev, [key]: [...current, value] };
      }
      return current.includes(value) ? { ...prev, [key]: [] } : { ...prev, [key]: [value] };
    });
  };

  const handleApplyFilters = () => {
    if (!categoryId) return toast.error("Please select a category");

    const requestBody: any = {
      categoryId,
      filters: {},
      page: 1,
      limit: 12,
    };

    Object.values(filters).forEach((group: any) => {
      if (!group.values) return;
      Object.entries(group.values).forEach(([fieldName, field]: [string, any]) => {
        const key = fieldName.toLowerCase() === "model" ? "model" : fieldName;
        const values = selectedValues[key];

        if (field.type === "range") {
          const range = ranges[field.fieldId];
          if (range) {
            requestBody.filters[field.fieldId] = { min: range[0], max: range[1] };
          }
        } else if (values?.length > 0) {
          if (key === "model") {
            requestBody.modelNames = values;
          } else {
            requestBody.filters[field.fieldId] = values[0];
          }
        }
      });
    });

    // Update parent state only - parent useEffect handles the actual fetch
    setActiveFilterPayload(requestBody);
    setIsFilterActive(true);
    setCurrentPage(1);
    toast.success("Filters applied!");
  };

  if (loading) return <Skeleton className="h-[400px] w-full" />;

  const renderedFieldNames = new Set<string>();

  return (
    <Card className="border-none shadow-none w-full">
      <CardContent className="space-y-6 bg-white p-4">
        {Object.entries(filters).map(([groupKey, group]: any) => (
          <div key={groupKey} className="space-y-6">
            {Object.entries(group.values || {}).map(([fieldName, field]: [string, any]) => {
              const normalizedName = fieldName.toLowerCase();
              if (renderedFieldNames.has(normalizedName)) return null;
              renderedFieldNames.add(normalizedName);

              if (field.type === "range") {
                const safeMin = Number(field.min);
                const safeMax = Number(field.max);
                if (safeMax <= safeMin) return null;
                const sliderValue = ranges[field.fieldId] ?? [safeMin, safeMax];
                const step = Math.max(Number(((safeMax - safeMin) / 100).toFixed(2)), 0.1);

                return (
                  <div key={field.fieldId} className="space-y-4 border-b pb-6 last:border-0">
                    <h4 className="text-sm font-bold uppercase text-[#163859]">{fieldName}</h4>
                    <Slider
                      value={sliderValue}
                      min={safeMin}
                      max={safeMax}
                      step={step}
                      onValueChange={(val) => setRanges((prev) => ({ ...prev, [field.fieldId]: val }))}
                      className="w-full py-4"
                    />
                    <div className="flex justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-xs font-bold">{sliderValue[0]}</span>
                      <span className="text-xs font-bold">{sliderValue[1]}</span>
                    </div>
                  </div>
                );
              }

              const key = normalizedName === "model" ? "model" : fieldName;
              const fieldValues = selectedValues[key] || [];
              const hasSelection = fieldValues.length > 0;

              return (
                <div key={fieldName} className="space-y-3">
                  <p className="text-sm font-medium text-gray-500 italic">{fieldName}</p>
                  <div className="flex flex-wrap gap-2">
                    {field.values?.slice(0, expandedFields[fieldName] ? undefined : 5).map((v: string) => {
                      const isSelected = fieldValues.includes(v);
                      const isDisabled = normalizedName !== "model" && hasSelection && !isSelected;
                      return (
                        <Badge
                          key={v}
                          variant={isSelected ? "default" : "secondary"}
                          className={`cursor-pointer ${isSelected ? "bg-[#163859]" : ""} ${isDisabled ? "opacity-30 pointer-events-none" : ""}`}
                          onClick={() => !isDisabled && toggleValue(fieldName, v)}
                        >
                          {v}
                        </Badge>
                      );
                    })}
                    {field.values?.length > 5 && (
                      <button onClick={() => toggleExpand(fieldName)} className="text-[10px] font-bold text-[#163859]">
                        {expandedFields[fieldName] ? "SHOW LESS" : `+${field.values.length - 5} MORE`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex flex-col gap-3 pt-4 border-t">
          <Button onClick={handleApplyFilters} className="w-full bg-[#163859]">Apply Filters</Button>
          <Button
            variant="ghost"
            className="text-xs w-full"
            onClick={() => {
              setSelectedValues({});
              setRanges({});
              setActiveFilterPayload(null);
              setIsFilterActive(false);
              setCurrentPage(1);
            }}
          >
            Reset All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
