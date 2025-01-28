import { useState } from "react";
import { MovieFilters } from "../MovieFilters";
import { PlatformFilter } from "./PlatformFilter";
import { GenreFilter } from "./GenreFilter";
import { RangeFilter } from "./RangeFilter";
import { TagsFilter } from "./TagsFilter";
import { FilterButtons } from "./FilterButtons";
import { useTranslation } from "react-i18next";
import { MOVIE_TAGS } from "../quiz/QuizConstants";

interface FilterContentProps {
  onFilterChange: (filters: MovieFilters) => void;
  currentFilters: MovieFilters;
  isMobile?: boolean;
}

export const FilterContent = ({
  onFilterChange,
  currentFilters,
  isMobile,
}: FilterContentProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);

  const handleTagSelect = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange({ ...currentFilters, tags: newTags });
  };

  const handleClear = () => {
    setSelectedTags([]);
    onFilterChange({
      yearRange: [2000, currentYear],
      minRating: 0,
    });
  };

  const handleApply = () => {
    onFilterChange({ ...currentFilters });
  };

  return (
    <div className="space-y-6">
      <PlatformFilter
        value={currentFilters.platform}
        onChange={(platform) => onFilterChange({ ...currentFilters, platform })}
      />
      <GenreFilter
        value={currentFilters.genre}
        onChange={(genre) => onFilterChange({ ...currentFilters, genre })}
      />
      <RangeFilter
        label={t("filters.year")}
        min={1900}
        max={currentYear}
        step={1}
        value={currentFilters.yearRange}
        onValueChange={(yearRange: [number, number]) =>
          onFilterChange({ ...currentFilters, yearRange })
        }
      />
      <RangeFilter
        label={t("filters.rating")}
        min={0}
        max={10}
        step={0.5}
        value={[currentFilters.minRating]}
        onValueChange={([minRating]) =>
          onFilterChange({ ...currentFilters, minRating })
        }
        displayValue={(v) => `${(v * 10).toFixed(0)}%`}
      />
      <TagsFilter
        tags={MOVIE_TAGS}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
      />
      {isMobile && (
        <FilterButtons onApply={handleApply} onClear={handleClear} />
      )}
    </div>
  );
};