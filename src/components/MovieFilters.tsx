import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { MOVIE_CATEGORIES } from "./quiz/QuizConstants";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { useTranslation } from "react-i18next";
import { MovieFilterSection } from "./movie/MovieFilterSection";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Filter, X } from "lucide-react";
import { Badge } from "./ui/badge";

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

      <div className="space-y-4">
        <label className="text-sm font-medium">{t("filters.tags")}</label>
        <div className="flex flex-wrap gap-2">
          {MOVIE_CATEGORIES.map((tag) => (
            <Badge
              key={tag}
              variant={tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTagSelect(tag)}
            >
              {t(`movie.${tag.toLowerCase()}`)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">{t("filters.yearRange")}</label>
        <Slider
          min={1900}
          max={currentYear}
          step={1}
          value={yearRange}
          onValueChange={(value) => setYearRange(value as [number, number])}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{yearRange[0]}</span>
          <span>{yearRange[1]}</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">{t("filters.minRating")}</label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[minRating]}
          onValueChange={(value) => setMinRating(value[0])}
          className="mt-2"
        />
        <div className="text-sm text-muted-foreground">
          {minRating}/100
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1">
          {t("filters.apply")}
        </Button>
        <Button onClick={handleClearFilters} variant="outline" className="flex-1">
          {t("filters.clear")}
        </Button>
      </div>
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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("filters.title")}</h3>
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary">
            {getActiveFiltersCount()} {t("filters.active")}
          </Badge>
        )}
      </div>
      <FilterContent />
    </div>
  );
};