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
    const { data: { YOUTUBE_API_KEY }, error } = await supabase
      .from('secrets')
      .select('YOUTUBE_API_KEY')
      .single();

    if (error || !YOUTUBE_API_KEY) {
      console.error('Error fetching YouTube API key:', error);
      return '';
    }

    const searchQuery = `${movieTitle} ${year || ''} official trailer`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data: YouTubeSearchResponse = await response.json();
    
    if (data.items && data.items.length > 0) {
      return `https://www.youtube.com/embed/${data.items[0].id.videoId}`;
    }

    return '';
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return '';
  }
};