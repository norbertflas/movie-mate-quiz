
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
        const region = languageToRegion[i18n.language] || 'us';
        console.log(`Fetching streaming services for region: ${region}`);
        const services = await getStreamingServicesByRegion(region);
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
  }, [i18n.language, t, toast]);

  // Debugging translation issues
  console.log(`[PlatformFilter] Current language: ${i18n.language}`);
  console.log(`[PlatformFilter] Filter label translation:`, t("filters.platform"));
  console.log(`[PlatformFilter] Loading translation:`, t("common.loading"));

  return (
    <MovieFilterSection
      label={t("filters.platform")}
      value={selectedPlatforms.join(',')}
      onValueChange={(value) => onPlatformChange(value ? value.split(',') : [])}
      placeholder={isLoading ? t("common.loading") : t("filters.selectPlatform")}
      options={streamingServices.map(service => ({
        id: service.id,
        name: t(`services.${service.name.toLowerCase()}`, service.name)
      }))}
    />
  );
};
