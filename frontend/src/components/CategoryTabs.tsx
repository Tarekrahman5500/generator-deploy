import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
  id: string;
  label: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  disableOthers?: boolean;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  disableOthers = false,
}: CategoryTabsProps) {
  console.log(activeCategory);
  console.log(categories);
  return (
    <Tabs
      value={activeCategory}
      onValueChange={(id) => onCategoryChange(id)}
      className="w-full "
    >
      <TabsList className="flex flex-wrap h-auto gap-2  justify-center p-2  border-2 cursor-pointer bg-blue-600 text-white w-36">
        {activeCategory}
      </TabsList>
    </Tabs>
  );
}
