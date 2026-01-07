import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react'; // Assuming you use lucide-react for icons
import { Label } from "@/components/ui/label"; // Adjust based on your UI library

export const SubCategoryInput = () => {
    const [subCategoryNames, setSubCategoryNames] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            // Prevent duplicates
            if (!subCategoryNames.includes(inputValue.trim())) {
                setSubCategoryNames([...subCategoryNames, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const removeTag = (indexToRemove: number) => {
        setSubCategoryNames(subCategoryNames.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="subcategories">
                Sub Categories <span className="text-destructive">*</span>
            </Label>

            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 ring-ring ring-offset-2">
                {/* Render the Tags/Chips */}
                {subCategoryNames.map((name, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 text-white bg-[#001f3f] rounded-full text-sm"
                    >
                        {name}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* The actual input field */}
                <input
                    id="subcategories"
                    className="flex-1 bg-transparent outline-none min-w-[120px] text-sm py-1"
                    placeholder={subCategoryNames.length === 0 ? "Type and press Enter..." : ""}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add a sub-category.</p>
        </div>
    );
};