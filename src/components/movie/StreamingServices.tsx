
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { Skeleton } from "../ui/skeleton";

interface StreamingServicesProps {
  services: string[];
}

export const StreamingServices = ({ services }: StreamingServicesProps) => {
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!services || services.length === 0) {
          setAvailableServices([]);
          setIsLoading(false);
          return;
        }
        
        const region = languageToRegion[i18n.language] || 'us';
        console.log(`Fetching streaming services for region ${region} and services:`, services);
        
        const allServices = await getStreamingServicesByRegion(region);
        
        if (!allServices || allServices.length === 0) {
          console.log('No streaming services found for region:', region);
          setAvailableServices([]);
          setIsLoading(false);
          return;
        }
        
        // Filter services that are available based on the services prop
        // Use more flexible matching to handle slight name variations
        const filteredServices = allServices.filter(service => 
          services.some(s => {
            // Normalize both strings for comparison: lowercase, remove spaces and special chars
            const serviceName = s.toLowerCase().trim().replace(/[\s+]/g, '');
            const dbServiceName = service.name.toLowerCase().trim().replace(/[\s+]/g, '');
            return serviceName === dbServiceName || 
                   dbServiceName.includes(serviceName) || 
                   serviceName.includes(dbServiceName);
          })
        );
        
        console.log('Streaming services found:', filteredServices.map(s => s.name).join(', '));
        setAvailableServices(filteredServices);
      } catch (error) {
        console.error('Error fetching streaming services:', error);
        setError('Failed to fetch streaming services');
        setAvailableServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamingServices();
  }, [i18n.language, services]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Streaming services error:", error);
    return null; // Hide errors from UI to improve user experience
  }

  if (!availableServices.length) {
    // Don't show anything if no streaming services are available
    return null;
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold">{t("streaming.availableOn")}</span>
      <div className="flex flex-wrap gap-2">
        {availableServices.map((service) => (
          <Badge key={service.id} variant="secondary">
            {t(`services.${service.name.toLowerCase()}`, service.name)}
          </Badge>
        ))}
      </div>
    </div>
  );
};
