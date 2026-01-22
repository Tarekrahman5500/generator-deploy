/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function GeneratorFilterCard({
  filters,
  loading = false,
  categoryId,
  setProducts,
  setIsFilterActive,
  setCurrentPage,
  setActiveFilterPayload,
}: any) {
  const [selectedValues, setSelectedValues] = useState<
    Record<string, string[]>
  >({});
  const [ranges, setRanges] = useState<Record<string, [number, number]>>({});
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    setSelectedValues({});
    setRanges({});
  }, [categoryId]);

  // Initialize range values from backend
  useEffect(() => {
    const initialRanges: Record<string, [number, number]> = {};

    Object.values(filters).forEach((filter: any) => {
      if (!filter.values) return;

      Object.values(filter.values).forEach((field: any) => {
        if (
          field.type === "range" &&
          typeof field.min === "number" &&
          typeof field.max === "number" &&
          field.max > field.min
        ) {
          initialRanges[field.fieldId] = [field.min, field.max];
        }
      });
    });

    setRanges(initialRanges);
  }, [filters]);

  const toggleExpand = (fieldName: string) => {
    setExpandedFields((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const toggleValue = (fieldName: string, value: string) => {
    setSelectedValues((prev) => {
      const current = prev[fieldName] || [];
      if (fieldName.toLowerCase() === "model") {
        return current.includes(value)
          ? { ...prev, [fieldName]: current.filter((v) => v !== value) }
          : { ...prev, [fieldName]: [...current, value] };
      }
      return current.includes(value)
        ? { ...prev, [fieldName]: [] }
        : { ...prev, [fieldName]: [value] };
    });
  };

  const handleApplyFilters = async () => {
    if (!categoryId) return toast.error("Please select a category");

    try {
      const requestBody: any = {
        categoryId,
        filters: {},
        page: 1,
        limit: 10,
      };

      Object.values(filters).forEach((filter: any) => {
        if (!filter.values) return;

        Object.entries(filter.values).forEach(
          ([fieldName, field]: [string, any]) => {
            // RANGE
            if (field.type === "range") {
              const range = ranges[field.fieldId];
              if (range) {
                requestBody.filters[field.fieldId] = {
                  min: range[0],
                  max: range[1],
                };
              }
            }

            // LIST
            else if (selectedValues[fieldName]?.length > 0) {
              requestBody.filters[field.fieldId] =
                fieldName.toLowerCase() === "model"
                  ? selectedValues[fieldName]
                  : selectedValues[fieldName][0];
            }
          },
        );
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/search/filter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await response.json();
      setProducts(data?.products || []);
      setActiveFilterPayload(requestBody); // ✅ STORE PAYLOAD
      setCurrentPage(1);
      setIsFilterActive(true);
      toast.success("Filters applied!");
    } catch {
      toast.error("Failed to fetch filtered products");
    }
  };

  if (loading) return <Skeleton className="h-[400px] w-full" />;

  return (
    <Card className="border-none shadow-none w-full">
      <CardContent className="space-y-6 bg-white p-4">
        {Object.entries(filters).map(([groupKey, group]: any) => (
          <div key={groupKey} className="space-y-6">
            {Object.entries(group.values || {}).map(
              ([fieldName, field]: [string, any]) => {
                // ---------- RANGE ----------
                if (field.type === "range") {
                  const safeMin = Number(field.min);
                  const safeMax = Number(field.max);
                  if (safeMax <= safeMin) return null;

                  const sliderValue = ranges[field.fieldId] ?? [
                    safeMin,
                    safeMax,
                  ];

                  const step = Math.max(
                    Number(((safeMax - safeMin) / 100).toFixed(2)),
                    0.1,
                  );

                  return (
                    <div
                      key={field.fieldId}
                      className="space-y-4 border-b pb-6 last:border-0"
                    >
                      <h4 className="text-sm font-bold uppercase text-[#163859]">
                        {fieldName}
                      </h4>

                      <Slider
                        value={sliderValue}
                        min={safeMin}
                        max={safeMax}
                        step={step}
                        onValueChange={(val) =>
                          setRanges((prev) => ({
                            ...prev,
                            [field.fieldId]: val,
                          }))
                        }
                        className="w-full py-4"
                      />

                      <div className="flex justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-xs font-bold">
                          {sliderValue[0]}
                        </span>
                        <span className="text-xs font-bold">
                          {sliderValue[1]}
                        </span>
                      </div>
                    </div>
                  );
                }

                // ---------- LIST ----------
                const hasSelection = selectedValues[fieldName]?.length > 0;

                return (
                  <div key={fieldName} className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 italic">
                      {fieldName}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {field.values
                        ?.slice(0, expandedFields[fieldName] ? undefined : 5)
                        .map((v: string) => {
                          const isSelected =
                            selectedValues[fieldName]?.includes(v);
                          const isDisabled =
                            fieldName.toLowerCase() !== "model" &&
                            hasSelection &&
                            !isSelected;

                          return (
                            <Badge
                              key={v}
                              variant={isSelected ? "default" : "secondary"}
                              className={`cursor-pointer ${isSelected ? "bg-[#163859]" : ""} ${
                                isDisabled
                                  ? "opacity-30 pointer-events-none"
                                  : ""
                              }`}
                              onClick={() =>
                                !isDisabled && toggleValue(fieldName, v)
                              }
                            >
                              {v}
                            </Badge>
                          );
                        })}

                      {field.values?.length > 5 && (
                        <button
                          onClick={() => toggleExpand(fieldName)}
                          className="text-[10px] font-bold text-[#163859]"
                        >
                          {expandedFields[fieldName]
                            ? "SHOW LESS"
                            : `+${field.values.length - 5} MORE`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 p-4">
        <Button onClick={handleApplyFilters} className="w-full bg-[#163859]">
          Apply Filters
        </Button>

        <Button
          variant="ghost"
          className="text-xs w-full"
          onClick={() => {
            setSelectedValues({});
            setRanges({});
            setCurrentPage(1); // ✅ RESET PAGINATION
            setIsFilterActive(false); // optional (if you want default view)
            setActiveFilterPayload(null);
          }}
        >
          Reset All
        </Button>
      </CardFooter>
    </Card>
  );
}
