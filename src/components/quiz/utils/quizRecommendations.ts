
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer } from "../QuizTypes";

export async function getQuizRecommendations(userId?: string, answers?: QuizAnswer[]) {
  try {
    console.log('Getting quiz recommendations for user:', userId);
    console.log('Quiz answers:', answers);
    
    // Call the Edge Function to get personalized recommendations
    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: { 
        userId,
        answers: answers || [],
        includeExplanations: true,
        maxResults: 20,
        region: 'PL'
      }
    });

    if (error) {
      console.error('Error calling recommendations function:', error);
      
      // Enhanced fallback recommendations based on quiz answers
      const fallbackRecommendations = getFallbackRecommendations(answers);
      console.log('Using enhanced fallback recommendations:', fallbackRecommendations);
      return fallbackRecommendations;
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response from recommendations function:', data);
      return getFallbackRecommendations(answers);
    }

    console.log('Received recommendations:', data);
    return data;
  } catch (error) {
    console.error('Error getting quiz recommendations:', error);
    return getFallbackRecommendations(answers);
  }
}

function getFallbackRecommendations(answers?: QuizAnswer[]) {
  const answerMap = answers?.reduce((map, answer) => {
    map[answer.questionId] = answer.answer;
    return map;
  }, {} as Record<string, string>) || {};

  const mood = answerMap.mood || 'funny';
  const genres = answerMap.genres ? answerMap.genres.split(',') : ['action'];
  const platforms = answerMap.platforms ? answerMap.platforms.split(',') : ['netflix'];

  // Generate recommendations based on user preferences
  const baseRecommendations = [
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
      explanation: "Perfect psychological thriller for complex storylines",
      matchScore: 90
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
      matchScore: 85
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
    },
    {
      id: 238,
      title: "The Godfather",
      poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      backdrop_path: "/mDcdpQNjxNoPCO3x3Z4V5IrIaTE.jpg",
      overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
      release_date: "1972-03-24",
      vote_average: 9.2,
      runtime: 175,
      genres: ["Drama", "Crime"],
      explanation: "Classic masterpiece for drama lovers",
      matchScore: 95
    },
    {
      id: 680,
      title: "Pulp Fiction",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      overview: "A burger-loving hit man, his philosophical partner, and a drug-addled gangster's moll.",
      release_date: "1994-10-14",
      vote_average: 8.9,
      runtime: 154,
      genres: ["Thriller", "Crime"],
      explanation: "Iconic thriller with unforgettable dialogue",
      matchScore: 88
    }
  ];

  // Filter and customize based on preferences
  let recommendations = [...baseRecommendations];

  // Adjust based on mood
  if (mood === 'funny') {
    recommendations.unshift({
      id: 12,
      title: "Finding Nemo",
      poster_path: "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
      backdrop_path: "/4dpBUCIlR0XHjfXFAy0hJIWlXm1.jpg",
      overview: "Nemo, an adventurous young clownfish, is unexpectedly taken from his Great Barrier Reef home to a dentist's office aquarium.",
      release_date: "2003-05-30",
      vote_average: 8.2,
      runtime: 100,
      genres: ["Animation", "Family", "Comedy"],
      explanation: "Perfect family comedy for a good laugh",
      matchScore: 92
    });
  }

  if (mood === 'adrenaline') {
    recommendations.unshift({
      id: 245891,
      title: "John Wick",
      poster_path: "/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
      backdrop_path: "/umC04Cozevu8nn3JTDJ1pc7PVTn.jpg",
      overview: "Ex-hitman John Wick comes out of retirement to track down the gangsters that took everything from him.",
      release_date: "2014-10-24",
      vote_average: 7.4,
      runtime: 101,
      genres: ["Action", "Thriller"],
      explanation: "Non-stop action perfect for adrenaline seekers",
      matchScore: 94
    });
  }

  // Add explanation about preferences
  recommendations = recommendations.map(rec => ({
    ...rec,
    explanation: `${rec.explanation} (Based on your ${mood} mood preference)`
  }));

  return recommendations.slice(0, 10);
}
