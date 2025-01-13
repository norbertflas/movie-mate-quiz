import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface FilterHeaderProps {
  activeFiltersCount: number;
}

export const FilterHeader = ({ activeFiltersCount }: FilterHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">{t("filters.title")}</h3>
      {activeFiltersCount > 0 && (
        <Badge variant="secondary">
          {activeFiltersCount} {t("filters.active")}
        </Badge>
      )}
    </div>
  );
};