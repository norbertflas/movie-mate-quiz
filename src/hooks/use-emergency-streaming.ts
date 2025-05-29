
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyStreamingData {
  services: any[];
  isLoading: boolean;
  error: Error | null;
  source: 'cache' | 'static' | 'emergency';
  apiCallsUsed: number;
  cacheHitRate: number;
}

const EMERGENCY_MODE = true; // Set to true to prevent API overuse
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Static fallback services by region
const STATIC_SERVICES = {
  'US': [
    { service: 'Netflix', link: 'https://netflix.com', available: true, type: 'subscription' },
    { service: 'Amazon Prime Video', link: 'https://amazon.com/prime-video', available: true, type: 'subscription' },
    { service: 'Disney+', link: 'https://disneyplus.com', available: true, type: 'subscription' },
    { service: 'Hulu', link: 'https://hulu.com', available: true, type: 'subscription' },
    { service: 'Apple TV+', link: 'https://tv.apple.com', available: true, type: 'subscription' }
  ],
  'PL': [
    { service: 'Netflix', link: 'https://netflix.com', available: true, type: 'subscription' },
    { service: 'Amazon Prime Video', link: 'https://amazon.com/prime-video', available: true, type: 'subscription' },
    { service: 'Disney+', link: 'https://disneyplus.com', available: true, type: 'subscription' },
    { service: 'Canal+', link: 'https://canalplus.pl', available: true, type: 'subscription' },
    { service: 'Player.pl', link: 'https://player.pl', available: true, type: 'subscription' }
  ]
};

// Cache management
const getCacheKey = (tmdbId: number, country: string) => `streaming_${tmdbId}_${country.toLowerCase()}`;

const getFromLocalCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const entry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
};

const setToLocalCache = (key: string, data: any) => {
  try {
    const entry = {
      data,
      timestamp: Date.now(),
      source: 'cache'
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache streaming data:', error);
  }
};

// API usage tracking
const logAPICall = (service: string, action: string) => {
  console.log(`📊 API Call: ${service} - ${action} - ${new Date().toISOString()}`);
  
  const calls = JSON.parse(localStorage.getItem('api_calls_today') || '[]');
  calls.push({ service, action, timestamp: Date.now() });
  localStorage.setItem('api_calls_today', JSON.stringify(calls));
  
  if (calls.length > 50) {
    console.warn('🚨 WARNING: 50+ API calls today!');
  }
};

export function useEmergencyStreaming(tmdbId: number, country: string = 'US') {
  const [state, setState] = useState<EmergencyStreamingData>({
    services: [],
    isLoading: false,
    error: null,
    source: 'emergency',
    apiCallsUsed: 0,
    cacheHitRate: 0
  });

  const fetchStreamingData = useCallback(async () => {
    if (!tmdbId || tmdbId <= 0) return;

    setState(prev => ({ ...prev, isLoading: true }));

    const cacheKey = getCacheKey(tmdbId, country);
    
    try {
      // Step 1: Check local cache first
      const cachedData = getFromLocalCache(cacheKey);
      if (cachedData) {
        console.log('✅ Cache HIT for', tmdbId);
        setState({
          services: cachedData,
          isLoading: false,
          error: null,
          source: 'cache',
          apiCallsUsed: 0,
          cacheHitRate: 100
        });
        return;
      }

      // Step 2: Check Supabase cache
      const { data: dbCache } = await supabase
        .from('streaming_cache')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .eq('country', country.toLowerCase())
        .gt('expires_at', new Date().toISOString())
        .single();

      if (dbCache) {
        console.log('✅ Database cache HIT for', tmdbId);
        const services = dbCache.streaming_data;
        setToLocalCache(cacheKey, services);
        
        setState({
          services,
          isLoading: false,
          error: null,
          source: 'cache',
          apiCallsUsed: 0,
          cacheHitRate: 95
        });
        return;
      }

      // Step 3: Emergency mode - use static data
      if (EMERGENCY_MODE) {
        console.log('🚨 Emergency mode - using static services for', tmdbId);
        const staticServices = STATIC_SERVICES[country.toUpperCase()] || STATIC_SERVICES['US'];
        
        // Cache the static data
        setToLocalCache(cacheKey, staticServices);
        
        // Also save to database for future use
        await supabase
          .from('streaming_cache')
          .upsert({
            tmdb_id: tmdbId,
            country: country.toLowerCase(),
            streaming_data: staticServices,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days for static data
            source: 'static'
          }, {
            onConflict: 'tmdb_id,country'
          });

        setState({
          services: staticServices,
          isLoading: false,
          error: null,
          source: 'emergency',
          apiCallsUsed: 0,
          cacheHitRate: 0
        });
        return;
      }

      // Step 4: If not emergency mode, make controlled API call
      logAPICall('streaming-api', 'fetch');
      
      // This would be your actual API call - commented out for safety
      // const apiData = await actualAPICall(tmdbId, country);
      
      // For now, use static data to prevent costs
      const fallbackServices = STATIC_SERVICES[country.toUpperCase()] || STATIC_SERVICES['US'];
      
      setState({
        services: fallbackServices,
        isLoading: false,
        error: null,
        source: 'static',
        apiCallsUsed: 1,
        cacheHitRate: 0
      });

    } catch (error) {
      console.error('Error in emergency streaming:', error);
      
      // Always fallback to static data on error
      const fallbackServices = STATIC_SERVICES[country.toUpperCase()] || STATIC_SERVICES['US'];
      
      setState({
        services: fallbackServices,
        isLoading: false,
        error: error as Error,
        source: 'emergency',
        apiCallsUsed: 0,
        cacheHitRate: 0
      });
    }
  }, [tmdbId, country]);

  useEffect(() => {
    fetchStreamingData();
  }, [fetchStreamingData]);

  return {
    ...state,
    refetch: fetchStreamingData
  };
}

// API usage monitoring
export function useAPIUsageMonitor() {
  const [usage, setUsage] = useState({
    callsToday: 0,
    cacheHits: 0,
    emergencyMode: EMERGENCY_MODE
  });

  useEffect(() => {
    const calls = JSON.parse(localStorage.getItem('api_calls_today') || '[]');
    const today = new Date().toDateString();
    const todaysCalls = calls.filter(call => 
      new Date(call.timestamp).toDateString() === today
    );

    setUsage({
      callsToday: todaysCalls.length,
      cacheHits: 0, // Calculate from cache statistics
      emergencyMode: EMERGENCY_MODE
    });
  }, []);

  return usage;
}
