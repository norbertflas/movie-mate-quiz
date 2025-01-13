export const MOOD_MATCHES = {
  "Lekki/Zabawny": ["Komedia", "Familijny", "Feel Good", "Animacja"],
  "Poważny/Dramatyczny": ["Dramat", "Biograficzny", "Wojenny", "Historyczny"],
  "Trzymający w napięciu": ["Thriller", "Horror", "Kryminał", "Mystery", "Akcja"],
  "Inspirujący": ["Biograficzny", "Dokumentalny", "Sport", "Muzyczny", "Przygodowy"]
};

export const getMoodScore = (movieGenre: string, movieTags: string[] = [], userMood: string): number => {
  const relevantMoods = MOOD_MATCHES[userMood] || [];
  return relevantMoods.includes(movieGenre) || 
         movieTags?.some(tag => relevantMoods.includes(tag)) ? 1 : 0;
};