import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface FilterButtonsProps {
  onApply: () => void;
  onClear: () => void;
}

export const FilterButtons = ({ onApply, onClear }: FilterButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <Button onClick={onApply} className="flex-1">
        {t("filters.apply")}
      </Button>
      <Button onClick={onClear} variant="outline" className="flex-1">
        {t("filters.clear")}
      </Button>
    </div>
  );
};