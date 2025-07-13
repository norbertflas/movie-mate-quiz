
import { Button } from "@/components/ui/button";

interface FilterButtonsProps {
  onApply: () => void;
  onClear: () => void;
}

export const FilterButtons = ({ onApply, onClear }: FilterButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onApply} className="flex-1">
        Apply Filters
      </Button>
      <Button onClick={onClear} variant="outline" className="flex-1">
        Clear All
      </Button>
    </div>
  );
};
