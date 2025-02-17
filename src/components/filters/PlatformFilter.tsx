
import { MovieFilterSection } from "../movie/MovieFilterSection";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import type { StreamingService } from "@/types/streaming";

interface PlatformFilterProps {
  selectedPlatforms: string[];
  onPlatformChange: (selected: string[]) => void;
}

export const PlatformFilter = ({ 
  selectedPlatforms = [], 
  onPlatformChange 
}: PlatformFilterProps) => {
  const [streamingServices, setStreamingServices] = useState<StreamingService[]>([]);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      const region = languageToRegion[i18n.language] || 'en';
      const services = await getStreamingServicesByRegion(region);
      setStreamingServices(services);
    };

    fetchStreamingServices();
  }, [i18n.language]);

  return (
    <MovieFilterSection
      label={t("filters.platform")}
      value={selectedPlatforms.join(',')}
      onValueChange={(value) => onPlatformChange(value ? value.split(',') : [])}
      placeholder={t("filters.selectPlatform")}
      options={streamingServices.map(service => ({
        id: service.id,
        name: t(`services.${service.name.toLowerCase()}`, service.name)
      }))}
    />
  );
};
