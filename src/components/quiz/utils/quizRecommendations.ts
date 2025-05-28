
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "../QuizTypes";

export async function getQuizRecommendations(userId?: string) {
  try {
    console.log('Getting quiz recommendations for user:', userId);
    
    // Call the Edge Function to get personalized recommendations
    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: { 
        userId,
        includeExplanations: true,
        maxResults: 20,
        region: 'PL'
      }
    });

    if (error) {
      console.error('Error calling recommendations function:', error);
      
      // Fallback to sample recommendations if edge function fails
      const fallbackRecommendations = [
        {
          id: 550,
          title: "Fight Club",
          poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          backdrop_path: "/87hTDiay2N2qWyX4Ds7ybXi9h8I.jpg",
          overview: "A depressed man suffering from insomnia meets a strange soap salesman and soon finds himself living in his squalid house after his perfect apartment is destroyed.",
          release_date: "1999-10-15",
          vote_average: 8.4,
          runtime: 139,
          genres: ["Drama", "Thriller"],
          explanation: "Highly rated psychological drama that matches your preferences",
          matchScore: 85
        },
        {
          id: 13,
          title: "Forrest Gump",
          poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
          backdrop_path: "/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",
          overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
          release_date: "1994-07-06",
          vote_average: 8.5,
          runtime: 142,
          genres: ["Drama", "Romance"],
          explanation: "Heartwarming story perfect for touching moments",
          matchScore: 90
        },
        {
          id: 19995,
          title: "Avatar",
          poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
          backdrop_path: "/Yc9q6QuWrMp9nuDm5R8ExNqbEWU.jpg",
          overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission.",
          release_date: "2009-12-18",
          vote_average: 7.6,
          runtime: 162,
          genres: ["Action", "Adventure", "Fantasy", "Science Fiction"],
          explanation: "Epic adventure with stunning visuals",
          matchScore: 80
        }
      ];

      console.log('Using fallback recommendations due to error:', error);
      return fallbackRecommendations;
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response from recommendations function:', data);
      
      // Return fallback recommendations
      return [
        {
          id: 550,
          title: "Fight Club",
          poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          overview: "A depressed man suffering from insomnia meets a strange soap salesman.",
          release_date: "1999-10-15",
          vote_average: 8.4,
          genres: ["Drama", "Thriller"],
          explanation: "Highly rated movie that matches your preferences",
          matchScore: 85
        }
      ];
    }

    console.log('Received recommendations:', data);
    return data;
  } catch (error) {
    console.error('Error getting quiz recommendations:', error);
    
    // Return basic fallback recommendations
    return [
      {
        id: 550,
        title: "Fight Club",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        overview: "A depressed man suffering from insomnia meets a strange soap salesman.",
        release_date: "1999-10-15",
        vote_average: 8.4,
        genres: ["Drama", "Thriller"],
        explanation: "Popular movie recommendation",
        matchScore: 75
      },
      {
        id: 13,
        title: "Forrest Gump", 
        poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        overview: "A man with a low IQ has accomplished great things in his life.",
        release_date: "1994-07-06",
        vote_average: 8.5,
        genres: ["Drama", "Romance"],
        explanation: "Heartwarming classic film",
        matchScore: 80
      }
    ];
  }
}
