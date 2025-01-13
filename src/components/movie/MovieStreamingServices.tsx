import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { motion } from "framer-motion";
import { Card } from "../ui/card";

interface MovieStreamingServicesProps {
  services: string[];
}

export const MovieStreamingServices = ({ services }: MovieStreamingServicesProps) => {
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
    <Card className="p-4 bg-background/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h4 className="font-medium text-lg">{t("availableOn")}</h4>
        <div className="flex flex-wrap gap-2">
          {availableServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2 px-3 py-1.5"
              >
                {service.logo_url && (
                  <img 
                    src={service.logo_url} 
                    alt={service.name} 
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="font-medium">{service.name}</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Card>
  );
};