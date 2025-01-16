import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase
      .functions.invoke('get-youtube-key', {
        body: { movieTitle, year }
      });

    if (error || !data?.key) {
      console.error('Error fetching YouTube API key:', error);
      return '';
    }

    const searchQuery = `${movieTitle} ${year || ''} official trailer`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&type=video&key=${data.key}&maxResults=1`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const responseData: YouTubeSearchResponse = await response.json();
    
    if (responseData.items && responseData.items.length > 0) {
      return `https://www.youtube.com/embed/${responseData.items[0].id.videoId}`;
    }

    return '';
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return '';
  }
};