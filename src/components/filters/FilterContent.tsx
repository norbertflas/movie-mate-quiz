import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PlatformFilter } from "./PlatformFilter";
import { GenreFilter } from "./GenreFilter";
import { TagsFilter } from "./TagsFilter";
import { RangeFilter } from "./RangeFilter";
import { FilterButtons } from "./FilterButtons";
import { MOVIE_CATEGORIES } from "../quiz/QuizConstants";
import type { MovieFilters } from "../MovieFilters";

interface FilterContentProps {
  onFilterChange: (filters: MovieFilters) => void;
  currentFilters: MovieFilters;
  isMobile?: boolean;
}

export const FilterContent = ({ onFilterChange, currentFilters, isMobile }: FilterContentProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState<[number, number]>(currentFilters.yearRange);
  const [minRating, setMinRating] = useState(currentFilters.minRating);
  const [platform, setPlatform] = useState(currentFilters.platform);
  const [genre, setGenre] = useState(currentFilters.genre);
  const [tags, setTags] = useState(currentFilters.tags || []);

  const handleApplyFilters = () => {
    onFilterChange({
      platform,
      genre,
      yearRange,
      minRating,
      tags,
    });
    if (isMobile) {
      // Mobile sheet will handle its own closing
    }
  };

  const handleClearFilters = () => {
    setPlatform(undefined);
    setGenre(undefined);
    setYearRange([2000, currentYear]);
    setMinRating(0);
    setTags([]);
    onFilterChange({
      yearRange: [2000, currentYear],
      minRating: 0,
    });
  };

  const handleTagSelect = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PlatformFilter value={platform} onChange={setPlatform} />
      <GenreFilter value={genre} onChange={setGenre} />

      <TagsFilter
        tags={MOVIE_CATEGORIES}
        selectedTags={tags}
        onTagSelect={handleTagSelect}
      />

      <RangeFilter
        label={t("filters.yearRange")}
        min={1900}
        max={currentYear}
        step={1}
        value={yearRange}
        onValueChange={(value) => setYearRange(value as [number, number])}
      />

      <RangeFilter
        label={t("filters.minRating")}
        min={0}
        max={100}
        step={1}
        value={[minRating]}
        onValueChange={(value) => setMinRating(value[0])}
        displayValue={(value) => `${value}/100`}
      />

      <FilterButtons onApply={handleApplyFilters} onClear={handleClearFilters} />
    </motion.div>
  );
};