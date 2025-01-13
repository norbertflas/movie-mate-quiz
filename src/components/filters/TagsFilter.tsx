import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface TagsFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export const TagsFilter = ({ tags, selectedTags, onTagSelect }: TagsFilterProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{t("filters.tags")}</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onTagSelect(tag)}
          >
            {t(`movie.${tag.toLowerCase()}`)}
          </Badge>
        ))}
      </div>
    </div>
  );
};