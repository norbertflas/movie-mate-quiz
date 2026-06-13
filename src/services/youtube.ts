import { api } from "@/lib/api-client";

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
    };
  }>;
}

export const getMovieTrailer = async (movieTitle: string, year?: string): Promise<string> => {
  try {
    let youtubeApiKey = "";
    try {
      const res = await api.get<{ key: string }>("/keys/youtube");
      youtubeApiKey = res.key;
    } catch (error) {
      console.error('Error fetching YouTube API key:', error);
      return '';
    }

    if (!youtubeApiKey) {
      return '';
    }

    const searchQuery = `${movieTitle} ${year || ''} official trailer`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&type=video&key=${youtubeApiKey}&maxResults=1`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const responseData: YouTubeSearchResponse = await response.json();
    
    if (responseData.items && responseData.items.length > 0) {
      const videoId = responseData.items[0].id.videoId;
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }

    return '';
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return '';
  }
};