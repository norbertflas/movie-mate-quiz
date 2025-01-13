import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MOVIE_CATEGORIES } from "./quiz/QuizConstants";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { useTranslation } from "react-i18next";
import { MovieFilterSection } from "./movie/MovieFilterSection";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Filter, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { FilterHeader } from "./filters/FilterHeader";
import { FilterButtons } from "./filters/FilterButtons";
import { TagsFilter } from "./filters/TagsFilter";
import { RangeFilter } from "./filters/RangeFilter";

interface MovieFiltersProps {
  onFilterChange: (filters: MovieFilters) => void;
}

export interface MovieFilters {
  platform?: string;
  genre?: string;
  yearRange: [number, number];
  minRating: number;
  tags?: string[];
}

export const MovieFilters = ({ onFilterChange }: MovieFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState<[number, number]>([2000, currentYear]);
  const [minRating, setMinRating] = useState(0);
  const [platform, setPlatform] = useState<string>();
  const [genre, setGenre] = useState<string>();
  const [tags, setTags] = useState<string[]>([]);
  const [streamingServices, setStreamingServices] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      const region = languageToRegion[i18n.language] || 'en';
      const services = await getStreamingServicesByRegion(region);
      setStreamingServices(services);
    };

    fetchStreamingServices();
  }, [i18n.language]);

  const handleApplyFilters = () => {
    onFilterChange({
      platform,
      genre,
      yearRange,
      minRating,
      tags,
    });
    if (isMobile) {
      setIsOpen(false);
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (platform) count++;
    if (genre) count++;
    if (yearRange[0] !== 2000 || yearRange[1] !== currentYear) count++;
    if (minRating > 0) count++;
    if (tags.length > 0) count++;
    return count;
  };

  const FilterContent = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <MovieFilterSection
        label={t("filters.platform")}
        value={platform}
        onValueChange={setPlatform}
        placeholder={t("filters.selectPlatform")}
        options={streamingServices.map(service => ({
          id: service.name,
          name: service.name,
        }))}
      />

      <MovieFilterSection
        label={t("filters.genre")}
        value={genre}
        onValueChange={setGenre}
        placeholder={t("filters.selectGenre")}
        options={MOVIE_CATEGORIES.map(category => ({
          id: category,
          name: t(`movie.${category.toLowerCase()}`),
        }))}
      />

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

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <Filter className="h-4 w-4 mr-2" />
            {t("filters.title")}
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
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
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-4">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <FilterHeader activeFiltersCount={getActiveFiltersCount()} />
      <FilterContent />
    </div>
  );
};