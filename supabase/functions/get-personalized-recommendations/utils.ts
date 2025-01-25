import { QuizAnswer } from "./types.ts";

export function cleanAnswers(answers: QuizAnswer[]): QuizAnswer[] {
  return answers.map(answer => {
    try {
      let cleanAnswer = answer.answer;
      // Handle nested JSON strings
      while (typeof cleanAnswer === 'string' && (cleanAnswer.startsWith('[') || cleanAnswer.startsWith('{'))) {
        try {
          cleanAnswer = JSON.parse(cleanAnswer);
        } catch {
          break;
        }
      }
      return {
        questionId: answer.questionId,
        answer: Array.isArray(cleanAnswer) ? cleanAnswer : cleanAnswer
      };
    } catch (error) {
      console.error('Error parsing answer:', error, answer);
      return answer;
    }
  });
}

export function formatAnswersForPrompt(answers: QuizAnswer[]): string {
  return answers.map(answer => 
    `Question ${answer.questionId}: ${
      Array.isArray(answer.answer) 
        ? answer.answer.join(', ') 
        : answer.answer
    }`
  ).join('\n');
}

export function getGenreId(genre: string): number {
  // Remove 'movie.' prefix if it exists and convert to lowercase
  const normalizedGenre = genre.toLowerCase().replace('movie.', '');
  
  const genreMap: Record<string, number> = {
    'action': 28,
    'adventure': 12,
    'comedy': 35,
    'drama': 18,
    'horror': 27,
    'romance': 10749,
    'scifi': 878,
    'sci-fi': 878,
    'thriller': 53,
    'documentary': 99
  };

  console.log('Normalized genre:', normalizedGenre);
  console.log('Available genres in map:', Object.keys(genreMap));
  
  const genreId = genreMap[normalizedGenre];

  if (!genreId) {
    console.error('Genre not found in map:', genre);
    console.error('Normalized genre not found:', normalizedGenre);
    console.error('Available genres:', Object.keys(genreMap));
    return 28; // Default to action if genre not found
  }

  return genreId;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};