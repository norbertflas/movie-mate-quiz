
import { Badge } from "@/components/ui/badge";

interface TagsFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export const TagsFilter = ({ tags, selectedTags, onTagSelect }: TagsFilterProps) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Movie Tags</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onTagSelect(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
