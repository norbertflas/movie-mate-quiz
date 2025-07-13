
import { Badge } from "@/components/ui/badge";

interface FilterHeaderProps {
  activeFiltersCount: number;
}

export const FilterHeader = ({ activeFiltersCount }: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Filters</h3>
      {activeFiltersCount > 0 && (
        <Badge variant="secondary">
          {activeFiltersCount} active
        </Badge>
      )}
    </div>
  );
};
