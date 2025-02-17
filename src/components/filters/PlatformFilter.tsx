
import { MovieFilterSection } from "../movie/MovieFilterSection";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import type { StreamingService } from "@/types/streaming";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      try {
        const region = languageToRegion[i18n.language] || 'en';
        const services = await getStreamingServicesByRegion(region);
        setStreamingServices(services);
      } catch (error) {
        console.error('Error fetching streaming services:', error);
        toast({
          title: t("errors.loadingServices"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      }
    };

    fetchStreamingServices();
  }, [i18n.language, t, toast]);

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
