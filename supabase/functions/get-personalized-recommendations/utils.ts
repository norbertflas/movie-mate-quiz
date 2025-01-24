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
  const genreMap: Record<string, number> = {
    'movie.action': 28,
    'movie.adventure': 12,
    'movie.comedy': 35,
    'movie.drama': 18,
    'movie.horror': 27,
    'movie.romance': 10749,
    'movie.sciFi': 878,
    'movie.thriller': 53,
    'movie.documentary': 99,
    // Direct genre names
    'action': 28,
    'adventure': 12,
    'comedy': 35,
    'drama': 18,
    'horror': 27,
    'romance': 10749,
    'sci-fi': 878,
    'thriller': 53,
    'documentary': 99
  };

  const normalizedGenre = genre.toLowerCase();
  const genreId = genreMap[normalizedGenre];

  if (!genreId) {
    console.error('Genre not found in map:', genre);
    console.error('Available genres:', Object.keys(genreMap));
    return 28; // Default to action if genre not found
  }

  return genreId;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};