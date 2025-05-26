
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
  const [isLoading, setIsLoading] = useState(false);
  const { i18n, t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      setIsLoading(true);
      try {
        // CRITICAL FIX: Always use 'us' region regardless of language
        const forceEnglishRegion = 'us';
        console.log(`Fetching streaming services for forced region: ${forceEnglishRegion} (language was: ${i18n.language})`);
        const services = await getStreamingServicesByRegion(forceEnglishRegion);
        setStreamingServices(services);
      } catch (error) {
        console.error('Error fetching streaming services:', error);
        toast({
          title: t("errors.loadingServices"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamingServices();
  }, [t, toast]); // Removed i18n.language dependency to prevent refetching

  // Create translated options for the filter
  const translatedOptions = streamingServices.map(service => ({
    id: service.id,
    name: t(`services.${service.name.toLowerCase()}`, { defaultValue: service.name })
  }));

  return (
    <MovieFilterSection
      label={t("filters.platform")}
      value={selectedPlatforms.join(',')}
      onValueChange={(value) => onPlatformChange(value ? value.split(',') : [])}
      placeholder={isLoading ? t("common.loading") : t("filters.selectPlatform")}
      options={translatedOptions}
    />
  );
};
