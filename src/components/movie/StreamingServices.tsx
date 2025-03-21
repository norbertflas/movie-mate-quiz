
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
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      setIsLoading(true);
      try {
        if (services.length === 0) {
          setAvailableServices([]);
          return;
        }
        
        const region = languageToRegion[i18n.language] || 'us';
        const allServices = await getStreamingServicesByRegion(region);
        
        // Filter services that are available based on the services prop
        const filteredServices = allServices.filter(service => 
          services.includes(service.name) || 
          services.some(s => s.toLowerCase() === service.name.toLowerCase())
        );
        
        console.log('Streaming services found:', filteredServices.map(s => s.name).join(', '));
        setAvailableServices(filteredServices);
      } catch (error) {
        console.error('Error fetching streaming services:', error);
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

  if (!availableServices.length) return null;

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold">{t("streaming.availableOn")}</span>
      <div className="flex flex-wrap gap-2">
        {availableServices.map((service) => (
          <Badge key={service.id} variant="secondary">
            {service.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};
