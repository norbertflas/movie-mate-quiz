const RAPIDAPI_BASE_URL = 'https://streaming-availability.p.rapidapi.com/v2';

interface StreamingInfo {
  service: string;
  streamingType: string;
  link: string;
  availableSince: string;
}

interface StreamingResponse {
  result: {
    streamingInfo: {
      [country: string]: StreamingInfo[];
    };
  }[];
}

export async function getStreamingAvailability(tmdbId: number, country: string = 'us'): Promise<StreamingInfo[]> {
  try {
    const response = await fetch(`${RAPIDAPI_BASE_URL}/get/basic/tmdb/movie/${tmdbId}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch streaming availability');
    }

    const data: StreamingResponse = await response.json();
    return data.result[0]?.streamingInfo[country] || [];
  } catch (error) {
    console.error('Error fetching streaming availability:', error);
    return [];
  }
}

export async function searchByStreaming(
  services: string[],
  country: string = 'us'
): Promise<number[]> {
  try {
    const response = await fetch(`${RAPIDAPI_BASE_URL}/search/basic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      },
      body: JSON.stringify({
        services: services,
        country: country,
        output_language: 'en',
        show_type: 'movie',
        order_by: 'popularity'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to search streaming movies');
    }

    const data = await response.json();
    return data.result.map((movie: any) => movie.tmdbId);
  } catch (error) {
    console.error('Error searching streaming movies:', error);
    return [];
  }
}