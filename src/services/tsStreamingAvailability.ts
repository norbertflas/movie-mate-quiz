
import i18n from "@/i18n";
import axios from "axios";

/**
 * Gets streaming availability information from the TS Streaming Availability API
 * @param tmdbId TMDB ID of the movie
 * @param country Country code (e.g. 'us', 'pl')
 * @param title Optional movie title for fallback search
 * @returns Array of streaming services or empty array
 */
export async function getTsStreamingAvailability(tmdbId: number, country: string = 'us', title?: string, year?: string) {
  try {
    console.log(`[TS API] Fetching streaming availability for TMDB ID: ${tmdbId}, country: ${country}, title: ${title}, year: ${year}`);
    
    // Determine the supported language for the API
    // The API supports limited languages, so we'll default to English for unsupported languages
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it'];
    const currentLanguage = i18n.language;
    const apiLanguage = supportedLanguages.includes(currentLanguage) ? currentLanguage : 'en';
    
    // Step 1: Try direct search by TMDB ID first
    try {
      const response = await axios.get('https://streaming-availability.p.rapidapi.com/v2/get/title', {
        params: {
          tmdb_id: `movie/${tmdbId}`,
          country: country.toLowerCase()
        },
        headers: {
          'X-RapidAPI-Key': '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9',
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      });
      
      if (response.data?.result?.streamingInfo) {
        const countryInfo = response.data.result.streamingInfo[country.toLowerCase()];
        
        if (countryInfo && countryInfo.length > 0) {
          console.log(`[TS API] Found ${countryInfo.length} streaming services for TMDB ID ${tmdbId}`);
          
          return countryInfo.map((info: any) => ({
            service: info.service,
            link: info.link,
            available: true,
            source: 'ts-api',
            type: info.type || 'subscription'
          }));
        }
      }
      
      console.log('[TS API] No streaming info found for TMDB ID, trying title search');
    } catch (error: any) {
      console.error(`[TS API] Error searching by TMDB ID: ${error.message}`);
      // Continue to title search fallback
    }
    
    // Step 2: Fallback to title search if TMDB ID search fails or returns no results
    if (title) {
      try {
        console.log(`[TS API] Attempting title search for: "${title}" in country: ${country}`);
        
        const titleResponse = await axios.get('https://streaming-availability.p.rapidapi.com/v2/search/title', {
          params: {
            title,
            country: country.toLowerCase(),
            show_type: 'movie',
            // Use a supported language for the API, defaulting to English
            output_language: apiLanguage
          },
          headers: {
            'X-RapidAPI-Key': '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9',
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        });
        
        if (titleResponse.data?.result && titleResponse.data.result.length > 0) {
          // Try to match by year if provided
          let match = titleResponse.data.result[0]; // Default to first result
          
          if (year) {
            // Try to find a better match by year
            const yearMatch = titleResponse.data.result.find((item: any) => 
              item.year === parseInt(year) || 
              (item.firstAirYear && item.firstAirYear === parseInt(year))
            );
            
            if (yearMatch) {
              match = yearMatch;
            }
          }
          
          if (match?.streamingInfo && match.streamingInfo[country.toLowerCase()]) {
            const countryInfo = match.streamingInfo[country.toLowerCase()];
            
            console.log(`[TS API] Found ${countryInfo.length} streaming services via title search`);
            
            return countryInfo.map((info: any) => ({
              service: info.service,
              link: info.link,
              available: true,
              source: 'ts-api-title-search',
              type: info.type || 'subscription'
            }));
          }
        }
        
        console.log('[TS API] No streaming info found via title search');
        return [];
      } catch (error: any) {
        console.error(`[TS API] Error in title search: ${error.message}`);
        
        // Check for specific error that indicates we should retry with English title
        if (
          error.response?.data?.message?.includes('invalid value') && 
          country.toLowerCase() === 'pl' && 
          !title.match(/^[a-zA-Z\s]+$/) // Check if title contains non-Latin characters
        ) {
          console.log('[TS API] Title may be in Polish, attempting to get English title from TMDB');
          // This would need an implementation to fetch the English title from TMDB
          // Left empty as placeholder - would need separate implementation
        }
        
        return [];
      }
    }
    
    return [];
  } catch (error: any) {
    console.error(`[TS API] General error in streaming availability service: ${error.message}`);
    return [];
  }
}
