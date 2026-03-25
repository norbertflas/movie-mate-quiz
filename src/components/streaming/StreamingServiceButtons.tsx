import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getUserRegion } from "@/utils/regionDetection";
import { useStreamingAvailability } from "@/hooks/use-streaming-availability";

interface StreamingServiceButtonsProps {
  tmdbId: number;
  title?: string;
  year?: string;
  className?: string;
}

interface StreamingService {
  service: string;
  logo: string;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  available: boolean;
}

const serviceLogos: Record<string, string> = {
  'Netflix': '/streaming-icons/netflix.svg',
  'Amazon Prime Video': '/streaming-icons/prime.svg',
  'Disney+': '/streaming-icons/disneyplus.svg',
  'Disney Plus': '/streaming-icons/disneyplus.svg',
  'HBO Max': '/streaming-icons/hbomax.svg',
  'Max': '/streaming-icons/max.svg',
  'Apple TV+': '/streaming-icons/appletv.svg',
  'Apple TV Plus': '/streaming-icons/appletv.svg',
  'Hulu': '/streaming-icons/hulu.svg',
  'Paramount+': '/streaming-icons/paramount.svg',
  'Paramount Plus': '/streaming-icons/paramount.svg',
  'Canal+': '/streaming-icons/default.svg',
  'Player.pl': '/streaming-icons/default.svg',
  'Polsat Box Go': '/streaming-icons/default.svg',
  'TVP VOD': '/streaming-icons/default.svg'
};

const defaultLinks: Record<string, (title: string, year?: string) => string> = {
  'Netflix': (title: string, year?: string) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  'Amazon Prime Video': (title: string, year?: string) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
  'Disney+': (title: string, year?: string) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  'Disney Plus': (title: string, year?: string) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  'HBO Max': (title: string, year?: string) => `https://www.max.com/search?q=${encodeURIComponent(title)}`,
  'Max': (title: string, year?: string) => `https://www.max.com/search?q=${encodeURIComponent(title)}`,
  'Apple TV+': (title: string, year?: string) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`,
  'Apple TV Plus': (title: string, year?: string) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`,
  'Hulu': (title: string, year?: string) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
  'Paramount+': (title: string, year?: string) => `https://www.paramountplus.com/search/${encodeURIComponent(title)}`,
  'Paramount Plus': (title: string, year?: string) => `https://www.paramountplus.com/search/${encodeURIComponent(title)}`
};

export const StreamingServiceButtons = ({ 
  tmdbId, 
  title = "", 
  year,
  className = "" 
}: StreamingServiceButtonsProps) => {
  const [streamingServices, setStreamingServices] = useState<StreamingService[]>([]);
  const [userRegion, setUserRegion] = useState<string>('US');
  const [isInTheaters, setIsInTheaters] = useState(false);
  
  const { services, isLoading, requested, fetchData } = useStreamingAvailability(
    tmdbId && tmdbId > 0 ? tmdbId : 0, title, year
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (!tmdbId || !title || requested) return;
    
    const init = async () => {
      const region = await getUserRegion();
      setUserRegion(region);

      // Check if movie is currently in theaters
      if (year) {
        const releaseDate = new Date(year);
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        if (releaseDate > threeMonthsAgo && releaseDate <= now) {
          setIsInTheaters(true);
        }
      }

      fetchData();
    };

    init();
  }, [tmdbId, title, requested]);

  // Transform API results to StreamingService format
  useEffect(() => {
    if (services.length > 0) {
      setIsInTheaters(false);
      const mapped: StreamingService[] = services.map(s => ({
        service: s.service,
        logo: serviceLogos[s.service] || '/streaming-icons/default.svg',
        link: s.link || defaultLinks[s.service]?.(title, year) || '#',
        type: (s.type as 'subscription' | 'rent' | 'buy' | 'free') || 'subscription',
        available: true
      }));

      // Deduplicate, prioritizing subscription > free > rent > buy
      const uniqueServices = mapped.reduce((acc, service) => {
        const existing = acc.find(s => s.service === service.service);
        if (!existing) {
          acc.push(service);
        } else {
          const priority = { subscription: 4, free: 3, rent: 2, buy: 1 };
          if ((priority[service.type] || 0) > (priority[existing.type] || 0)) {
            acc[acc.indexOf(existing)] = service;
          }
        }
        return acc;
      }, [] as StreamingService[]);

      setStreamingServices(uniqueServices);
    } else if (requested && !isLoading) {
      setStreamingServices([]);
    }
  }, [services, requested, isLoading, title, year]);

  const handleServiceClick = (service: StreamingService) => {
    if (service.link && service.link !== '#') {
      window.open(service.link, '_blank', 'noopener,noreferrer');
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'subscription': return '∞';
      case 'rent': return '⏰';
      case 'buy': return '💰';
      case 'free': return '🆓';
      default: return '▶';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-20 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (requested && !isLoading && streamingServices.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {isInTheaters ? (
          <span>🎬 Ten film jest aktualnie wyświetlany w kinach</span>
        ) : (
          <span>Film aktualnie nie jest dostępny w żadnym serwisie streamingowym w Twoim regionie ({userRegion})</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {streamingServices.map((service, index) => (
        <Button
          key={`${service.service}-${index}`}
          variant="outline"
          size="sm"
          onClick={() => handleServiceClick(service)}
          className="h-10 px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
          disabled={!service.link || service.link === '#'}
        >
          <img 
            src={service.logo} 
            alt={service.service}
            className="w-4 h-4 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/streaming-icons/default.svg';
            }}
          />
          <span className="text-xs font-medium">{getTypeIcon(service.type)}</span>
          <ExternalLink className="w-3 h-3" />
        </Button>
      ))}
      <div className="text-xs text-muted-foreground mt-1">
        Region: {userRegion}
      </div>
    </div>
  );
};

export default StreamingServiceButtons;