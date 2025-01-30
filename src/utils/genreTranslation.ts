export const getGenreTranslationKey = (genreId: number): string => {
  // TMDB genre IDs mapped to our translation keys
  const genreMap: Record<number, string> = {
    28: "action",
    12: "adventure",
    16: "animation",
    35: "comedy",
    80: "crime",
    99: "documentary",
    18: "drama",
    10751: "family",
    14: "fantasy",
    36: "history",
    27: "horror",
    10402: "music",
    9648: "mystery",
    10749: "romance",
    878: "sciFi",
    53: "thriller",
    10752: "war",
    37: "western"
  };

  return genreMap[genreId] || "unknown";
};