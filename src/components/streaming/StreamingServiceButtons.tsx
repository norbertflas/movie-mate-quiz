import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getUserRegion } from "@/utils/regionDetection";

interface StreamingServiceButtonsProps {
  tmdbId: number;
  title?: string;
  year?: string;
  className?: string;
}

interface StreamingService {
  service: string;
  logoPath: string;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
}

const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";

const defaultSearchLinks: Record<string, (title: string) => string> = {
  'Netflix': (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  'Amazon Prime Video': (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`,
  'Disney Plus': (t) => `https://www.disneyplus.com/search?q=${encodeURIComponent(t)}`,
  'Disney+': (t) => `https://www.disneyplus.com/search?q=${encodeURIComponent(t)}`,
  'Max': (t) => `https://www.max.com/search?q=${encodeURIComponent(t)}`,
  'HBO Max': (t) => `https://www.max.com/search?q=${encodeURIComponent(t)}`,
  'Apple TV Plus': (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`,
  'Apple TV+': (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`,
  'Hulu': (t) => `https://www.hulu.com/search?q=${encodeURIComponent(t)}`,
  'Paramount Plus': (t) => `https://www.paramountplus.com/search/${encodeURIComponent(t)}`,
  'Paramount+': (t) => `https://www.paramountplus.com/search/${encodeURIComponent(t)}`,
};

export const StreamingServiceButtons = ({
  tmdbId,
  title = "",
  year,
  className = ""
}: StreamingServiceButtonsProps) => {
  const [services, setServices] = useState<StreamingService[]>([]);
  const [userRegion, setUserRegion] = useState<string>('PL');
  const [isLoading, setIsLoading] = useState(false);
  const [providerLink, setProviderLink] = useState<string>('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!tmdbId || hasFetched.current) return;
    hasFetched.current = true;

    const fetchWatchProviders = async () => {
      setIsLoading(true);
      try {
        const region = await getUserRegion();
        setUserRegion(region);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        let url = `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers`;

        if (TMDB_ACCESS_TOKEN) {
          headers['Authorization'] = `Bearer ${TMDB_ACCESS_TOKEN}`;
        } else if (TMDB_API_KEY) {
          url += `?api_key=${TMDB_API_KEY}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) throw new Error(`TMDB error: ${response.status}`);

        const data = await response.json();
        const regionData = data.results?.[region];

        if (!regionData) {
          setServices([]);
          return;
        }

        if (regionData.link) setProviderLink(regionData.link);

        const collected: StreamingService[] = [];
        const seen = new Set<string>();

        const addProviders = (list: any[], type: StreamingService['type']) => {
          for (const p of list || []) {
            const name: string = p.provider_name;
            if (!seen.has(name)) {
              seen.add(name);
              collected.push({
                service: name,
                logoPath: p.logo_path ? `${TMDB_IMAGE_BASE}${p.logo_path}` : '',
                link: regionData.link || defaultSearchLinks[name]?.(title) || '#',
                type,
              });
            }
          }
        };

        addProviders(regionData.flatrate, 'subscription');
        addProviders(regionData.free, 'free');
        addProviders(regionData.ads, 'free');
        addProviders(regionData.rent, 'rent');
        addProviders(regionData.buy, 'buy');

        setServices(collected);
      } catch (error) {
        console.error('Error fetching TMDB watch providers:', error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchProviders();
  }, [tmdbId]);

  const getTypeLabel = (type: StreamingService['type']): string => {
    switch (type) {
      case 'subscription': return 'abonament';
      case 'free': return 'za darmo';
      case 'rent': return 'wynajem';
      case 'buy': return 'kup';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Brak informacji o dostępności w regionie: {userRegion}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {services.map((s, i) => (
        <Button
          key={`${s.service}-${i}`}
          variant="outline"
          size="sm"
          onClick={() => s.link && s.link !== '#' && window.open(s.link, '_blank', 'noopener,noreferrer')}
          className="h-10 px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
          title={`${s.service} · ${getTypeLabel(s.type)}`}
          disabled={!s.link || s.link === '#'}
        >
          {s.logoPath ? (
            <img
              src={s.logoPath}
              alt={s.service}
              className="w-5 h-5 rounded object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : null}
          <span className="text-xs font-medium max-w-[80px] truncate">{s.service}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </Button>
      ))}
      <div className="w-full text-xs text-muted-foreground mt-1">
        Region: {userRegion} · źródło: JustWatch via TMDB
      </div>
    </div>
  );
};

export default StreamingServiceButtons;
