import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getMovieRecommendations(formattedAnswers: string, apiKey: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const aiPrompt = `You are a movie recommendation expert. Based on these quiz answers:
  ${formattedAnswers}
  
  Please suggest 6 highly relevant movies. Focus on popular, well-rated movies that match the genre and mood preferences.
  Format your response as a JSON array of TMDB movie IDs only, like this: [123, 456, 789]
  Only include the JSON array in your response, no other text.`;

  console.log('Sending prompt to Gemini:', aiPrompt);

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${MAX_RETRIES}`);
      
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text.trim().startsWith('[') || !text.trim().endsWith(']')) {
        throw new Error('Invalid response format from Gemini');
      }
      
      const movieIds = JSON.parse(text);
      if (!Array.isArray(movieIds) || movieIds.length === 0) {
        throw new Error('Invalid movie IDs array from Gemini');
      }

      console.log('Successfully received movie IDs:', movieIds);
      return movieIds;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      // If it's not the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * attempt; // Exponential backoff
        console.log(`Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }

  // If we get here, all retries failed
  throw new Error(`Failed to get movie recommendations after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}