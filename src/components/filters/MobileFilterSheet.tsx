import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { FilterContent } from "./FilterContent";
import type { MovieFilters } from "../MovieFilters";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeFiltersCount: number;
  onFilterChange: (filters: MovieFilters) => void;
  currentFilters: MovieFilters;
}

export const MobileFilterSheet = ({
  isOpen,
  onOpenChange,
  activeFiltersCount,
  onFilterChange,
  currentFilters,
}: MobileFilterSheetProps) => {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="mb-4">
          <Filter className="h-4 w-4 mr-2" />
          {t("filters.title")}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>{t("filters.title")}</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="mt-4">
          <FilterContent
            onFilterChange={onFilterChange}
            currentFilters={currentFilters}
            isMobile={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};