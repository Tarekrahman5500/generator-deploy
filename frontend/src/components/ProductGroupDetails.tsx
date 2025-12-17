import { Box, Info, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

interface GroupConfig {
  id: string;
  label: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  id: string;
  fieldName: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  suffix?: string;
  options?: { value: string; label: string }[];
}

interface ProductGroupDetailsProps {
  groups: GroupConfig[];
  currentGroup: string;
  onGroupChange: (groupId: string) => void;
  values: Record<string, string>;
  onValueChange: (fieldId: string, value: string) => void;
  categoryLabel: string;
}

export function ProductGroupDetails({
  groups,
  currentGroup,
  onGroupChange,
  values,
  onValueChange,
  categoryLabel,
}: ProductGroupDetailsProps) {
  const activeGroup = groups.find((g) => g.id === currentGroup) || groups[0];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Box className="w-4 h-4 text-orange-600" />
            </div>
            Product Group Details
          </CardTitle>

          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
              Current Group
            </span>

            <span className="mr-2">
              <NavLink to="/dashboard/add-groups">
                <Button variant="link" size="sm">
                  Add Group
                </Button>
              </NavLink>
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {activeGroup?.label}

                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => onGroupChange(group.id)}
                    className={currentGroup === group?.id ? "bg-accent" : ""}
                  >
                    {group?.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 animate-fade-in">
          {activeGroup?.fields?.map((field) => (
            <div key={field?.id} className="space-y-2">
              <Label htmlFor={field?.id}>{field?.fieldName}</Label>
              {field.type === "select" ? (
                <Select
                  value={values[field?.id] || ""}
                  onValueChange={(value) => onValueChange(field?.id, value)}
                >
                  <SelectTrigger id={field.id}>
                    <SelectValue
                      placeholder={
                        field?.placeholder || `Select ${field?.fieldName}`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option?.value} value={option?.value}>
                        {option?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Input
                    id={field?.id}
                    type={field?.type}
                    placeholder={field.placeholder}
                    value={values[field.id] || ""}
                    onChange={(e) => onValueChange(field.id, e.target.value)}
                    className={field.suffix ? "pr-12" : ""}
                  />
                  {field.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {field.suffix}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Alert className="mt-6 bg-muted/50 border-muted">
          <Info className="w-4 h-4" />
          <AlertDescription>
            These fields are specific to the <strong>{categoryLabel}</strong>{" "}
            category. Changing tabs will discard unsaved data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
