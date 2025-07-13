
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
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      setIsLoading(true);
      try {
        // Use the actual language-to-region mapping instead of forcing 'us'
        const userRegion = languageToRegion[i18n.language] || 'us';
        console.log(`[PlatformFilter] Fetching streaming services for user region: ${userRegion} (language: ${i18n.language})`);
        const services = await getStreamingServicesByRegion(userRegion);
        console.log(`[PlatformFilter] Retrieved ${services.length} streaming services for ${userRegion.toUpperCase()}`);
        setStreamingServices(services);
      } catch (error) {
        console.error('[PlatformFilter] Error fetching streaming services:', error);
        toast({
          title: "Error loading services",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamingServices();
  }, [toast, i18n.language]); // Now includes language dependency

  // Create translated options for the filter
  const translatedOptions = streamingServices.map(service => ({
    id: service.id,
    name: service.name // Use the service name directly instead of translation
  }));

  return (
    <MovieFilterSection
      label="Streaming Platform"
      value={selectedPlatforms.join(',')}
      onValueChange={(value) => onPlatformChange(value ? value.split(',') : [])}
      placeholder={isLoading ? "Loading..." : "Select Platform"}
      options={translatedOptions}
    />
  );
};
