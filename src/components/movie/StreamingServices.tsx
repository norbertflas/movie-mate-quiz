import { useEffect, useState, memo, useMemo } from "react";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { ExternalLink } from "lucide-react";

interface StreamingServicesProps {
  services: string[];
  links?: Record<string, string>;
}

export const StreamingServices = memo(({ services, links = {} }: StreamingServicesProps) => {
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n, t } = useTranslation();

  // Memoize region calculation
  const region = useMemo(() => 
    languageToRegion[i18n.language] || 'us', [i18n.language]
  );

  // Memoize service processing function
  const processServices = useMemo(() => async () => {
    if (!services || services.length === 0) {
      setAvailableServices([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const allServices = await getStreamingServicesByRegion(region);
      
      if (!allServices || allServices.length === 0) {
        setAvailableServices([]);
        setIsLoading(false);
        return;
      }
      
      const servicesWithLinks = services.map(serviceName => {
        // Find matching service in database
        const dbService = allServices.find(service => {
          const normalizedServiceName = serviceName.toLowerCase().trim().replace(/[\s+]/g, '');
          const normalizedDbName = service.name.toLowerCase().trim().replace(/[\s+]/g, '');
          return normalizedServiceName === normalizedDbName || 
                 normalizedDbName.includes(normalizedServiceName) || 
                 normalizedServiceName.includes(normalizedDbName);
        });
        
        // Find corresponding link
        const linkKey = Object.keys(links).find(key => {
          const linkServiceName = key.toLowerCase().trim().replace(/[\s+]/g, '');
          const currentServiceName = serviceName.toLowerCase().trim().replace(/[\s+]/g, '');
          return linkServiceName === currentServiceName || 
                 currentServiceName.includes(linkServiceName) || 
                 linkServiceName.includes(currentServiceName);
        });
        
        return {
          id: dbService?.id || serviceName,
          name: serviceName,
          logo_url: dbService?.logo_url || `/streaming-icons/${serviceName.toLowerCase().replace(/\s+/g, '')}.svg`,
          link: linkKey ? links[linkKey] : generateDefaultLink(serviceName)
        };
      });
      
      console.log('Streaming services processed:', servicesWithLinks.map(s => s.name).join(', '));
      setAvailableServices(servicesWithLinks);
    } catch (error) {
      console.error('Error fetching streaming services:', error);
      setError('Failed to fetch streaming services');
      setAvailableServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [services, region, links]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    processServices();
  }, [processServices]);

  const generateDefaultLink = (serviceName: string): string => {
    const normalized = serviceName.toLowerCase().replace(/[\s+]/g, '');
    
    switch (normalized) {
      case 'netflix':
        return 'https://www.netflix.com';
      case 'primevideo':
      case 'amazon':
      case 'amazonprime':
        return 'https://www.primevideo.com';
      case 'disney+':
      case 'disneyplus':
        return 'https://www.disneyplus.com';
      case 'hulu':
        return 'https://www.hulu.com';
      case 'hbomax':
      case 'max':
        return 'https://play.max.com';
      case 'appletv+':
      case 'appletv':
        return 'https://tv.apple.com';
      default:
        return `https://www.${normalized}.com`;
    }
  };

  const openStreamingService = (link: string, serviceName: string) => {
    if (!link) return;
    
    // Ensure proper URL format
    let url = link;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    console.log(`Opening streaming service: ${serviceName} with URL: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  if (error || !availableServices.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-semibold text-foreground">{t("streaming.availableOn")}</span>
      <div className="flex flex-wrap gap-2">
        {availableServices.map((service) => (
          <Button 
            key={service.id || service.name} 
            variant="outline"
            size="sm"
            onClick={() => openStreamingService(service.link, service.name)}
            className="rounded-lg flex items-center gap-2 px-3 py-2 h-auto text-xs hover:bg-primary/10 transition-colors border-border/50"
          >
            <img 
              src={service.logo_url} 
              alt={service.name}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `/streaming-icons/default.svg`;
              }}
            />
            <span>{t(`services.${service.name.toLowerCase()}`, { defaultValue: service.name })}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Button>
        ))}
      </div>
    </div>
  );
});

StreamingServices.displayName = "StreamingServices";
