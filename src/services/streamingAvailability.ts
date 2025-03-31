import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import axios from 'axios';
import i18n from "@/i18n";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 godziny

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache w pamięci na czas sesji
const localCache: Record<string, StreamingAvailabilityCache> = {};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error('Error in retryWithBackoff:', error);

    if (retries === 0) {
      throw error;
    }

    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      const retryAfter = (errorBody?.retryAfter || 60) * 1000;
      console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
      await sleep(retryAfter);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Nowa implementacja korzystająca bezpośrednio z Streaming Availability API
async function fetchStreamingAvailabilityAPI(
  tmdbId: number,
  mediaType: 'movie' | 'series' = 'movie',
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    // Sprawdź lokalny cache w pamięci najpierw
    const cacheKey = `${tmdbId}-${country}`;
    if (localCache[cacheKey] && (Date.now() - localCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log('Using memory cached streaming data for:', tmdbId);
      return localCache[cacheKey].data;
    }
    
    // Klucz API do Streaming Availability
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    const options = {
      method: 'GET',
      url: `https://streaming-availability.p.rapidapi.com/shows/${mediaType}/${tmdbId}`,
      params: { 
        countryId: country
      },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const data = response.data;
    
    if (!data) {
      throw new Error('Empty response from Streaming Availability API');
    }
    
    // Konwersja odpowiedzi API do formatu StreamingPlatformData
    const streamingPlatforms: StreamingPlatformData[] = [];
    
    // Sprawdź, czy dane są dostępne i mają strukturę, jakiej oczekujemy
    if (data.streamingInfo && Object.keys(data.streamingInfo).length > 0) {
      for (const [serviceName, serviceData] of Object.entries(data.streamingInfo[country] || {})) {
        if (Array.isArray(serviceData)) {
          const service = serviceData[0]; // Bierzemy pierwsze źródło
          
          streamingPlatforms.push({
            service: serviceName,
            available: true,
            link: service.link || `https://${serviceName.toLowerCase()}.com`,
            startDate: service.availableSince,
            endDate: service.leavingSoon ? service.availableUntil : undefined,
            logo: getStreamingServiceLogo(serviceName),
            type: service.type // Subscription, rent, buy
          });
        }
      }
    }

    // Zapisz do lokalnego cache'a
    localCache[cacheKey] = {
      data: streamingPlatforms,
      timestamp: Date.now()
    };
    
    // Zapisz do bazy danych jako cache
    await cacheResults(streamingPlatforms, tmdbId, country);
    
    return streamingPlatforms;
  } catch (error) {
    console.error('Error fetching from Streaming Availability API:', error);
    return [];
  }
}

// Helper do pobierania logo serwisu streamingowego
function getStreamingServiceLogo(serviceName: string): string {
  const serviceMap: Record<string, string> = {
    'netflix': '/public/streaming-icons/netflix.svg',
    'prime': '/public/streaming-icons/prime.svg',
    'disney': '/public/streaming-icons/disney.svg',
    'hbo': '/public/streaming-icons/max.svg',
    'hulu': '/public/streaming-icons/hulu.svg',
    'apple': '/public/streaming-icons/apple.svg',
    'paramount': '/public/streaming-icons/paramount.svg',
    // Dodaj więcej serwisów według potrzeb
  };

  return serviceMap[serviceName.toLowerCase()] || '/public/streaming-icons/default.svg';
}

export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  country?: string
): Promise<StreamingPlatformData[]> {
  try {
    // Określ kraj na podstawie języka lub parametru
    const currentLang = i18n.language;
    const streamingCountry = country || (currentLang === 'pl' ? 'pl' : 'us');
    
    // Sprawdź najpierw cache z odpowiednią obsługą wygaśniętych danych
    const { data: cachedServices, error: cacheError } = await supabase
      .from('movie_streaming_availability')
      .select(`
        streaming_services:service_id(
          name,
          logo_url
        )
      `)
      .eq('tmdb_id', tmdbId)
      .eq('region', streamingCountry)
      .gte('available_since', new Date(Date.now() - CACHE_DURATION).toISOString());

    if (cachedServices?.length > 0) {
      console.log('Using cached streaming data from DB for movie:', tmdbId);
      return cachedServices.map(item => ({
        service: item.streaming_services.name,
        link: `https://${item.streaming_services.name.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`,
        logo: item.streaming_services.logo_url,
        available: true,
        startDate: new Date().toISOString()
      }));
    }

    console.log('Fetching fresh streaming data for movie:', tmdbId);
    
    // Użyj bezpośredniego API Streaming Availability
    const streamingResults = await fetchStreamingAvailabilityAPI(tmdbId, 'movie', streamingCountry);
    
    if (streamingResults.length > 0) {
      return streamingResults;
    }
    
    // Jeśli bezpośrednie API nie zwróciło wyników, spróbuj zapasowych metod
    
    // Spróbuj najpierw DeepSeek
    try {
      const deepseekResponse = await retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-deepseek', {
          body: { tmdbId, title, year, country: streamingCountry },
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.data) {
          throw new Error('Empty response from DeepSeek API');
        }
        
        return response.data?.result || [];
      });

      if (deepseekResponse.length > 0) {
        await cacheResults(deepseekResponse, tmdbId, streamingCountry);
        return deepseekResponse;
      }
    } catch (error) {
      console.error('DeepSeek API error:', error);
    }

    // Spróbuj Gemini jako zapasowy
    await sleep(1000);

    try {
      const geminiResponse = await retryWithBackoff(async () => {
        const response = await supabase.functions.invoke('streaming-availability-gemini', {
          body: { tmdbId, title, year, country: streamingCountry },
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.data) {
          throw new Error('Empty response from Gemini API');
        }
        
        return response.data?.result || [];
      });

      if (geminiResponse.length > 0) {
        await cacheResults(geminiResponse, tmdbId, streamingCountry);
        return geminiResponse;
      }
    } catch (error) {
      console.error('Gemini API error:', error);
    }

    return [];
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}

async function cacheResults(services: StreamingPlatformData[], tmdbId: number, country: string) {
  try {
    if (services.length > 0) {
      const { data: streamingServices } = await supabase
        .from('streaming_services')
        .select('id, name')
        .in('name', services.map(s => s.service));

      if (streamingServices?.length > 0) {
        const serviceMap = new Map(streamingServices.map(s => [s.name.toLowerCase(), s.id]));
        
        const availabilityRecords = services.map(service => ({
          tmdb_id: tmdbId,
          service_id: serviceMap.get(service.service.toLowerCase()),
          region: country,
          available_since: new Date().toISOString()
        })).filter(record => record.service_id !== undefined);

        if (availabilityRecords.length > 0) {
          const { error } = await supabase
            .from('movie_streaming_availability')
            .upsert(availabilityRecords, {
              onConflict: 'tmdb_id,service_id,region'
            });

          if (error) {
            console.error('Error caching streaming results:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error caching streaming results:', error);
  }
}
