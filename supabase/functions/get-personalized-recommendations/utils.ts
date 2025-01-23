import { QuizAnswer } from "./types.ts";

export function cleanAnswers(answers: QuizAnswer[]): QuizAnswer[] {
  return answers.map(answer => {
    try {
      let cleanAnswer = answer.answer;
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

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};