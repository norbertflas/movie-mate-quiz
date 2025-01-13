import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";

interface StreamingServicesProps {
  services: string[];
}

export const StreamingServices = ({ services }: StreamingServicesProps) => {
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      const region = languageToRegion[i18n.language] || 'en';
      const allServices = await getStreamingServicesByRegion(region);
      const filteredServices = allServices.filter(service => 
        services.includes(service.name)
      );
      setAvailableServices(filteredServices);
    };

    fetchStreamingServices();
  }, [i18n.language, services]);

  if (!availableServices.length) return null;

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold">{t("availableOn")}</span>
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