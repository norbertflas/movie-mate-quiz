import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { MOVIE_CATEGORIES } from "./quiz/QuizConstants";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { useTranslation } from "react-i18next";
import { MovieFilterSection } from "./movie/MovieFilterSection";

interface MovieFiltersProps {
  onFilterChange: (filters: MovieFilters) => void;
}

export interface MovieFilters {
  platform?: string;
  genre?: string;
  yearRange: [number, number];
  minRating: number;
}

export const MovieFilters = ({ onFilterChange }: MovieFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState<[number, number]>([2000, currentYear]);
  const [minRating, setMinRating] = useState(0);
  const [platform, setPlatform] = useState<string>();
  const [genre, setGenre] = useState<string>();
  const [streamingServices, setStreamingServices] = useState<any[]>([]);
  const { i18n, t } = useTranslation();

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
    });
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <h3 className="font-semibold mb-4">{t("filters.title")}</h3>
      
      <div className="space-y-4">
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
            name: category,
          }))}
        />

        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <Button onClick={handleApplyFilters} className="w-full">
          {t("filters.apply")}
        </Button>
      </div>
    </div>
  );
};