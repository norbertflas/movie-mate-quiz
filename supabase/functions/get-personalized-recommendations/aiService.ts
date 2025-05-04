
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getMovieRecommendations(
  input: string,
  selectedMovies: Array<{ id: number; title: string; genres?: number[]; }> = [],
  apiKey: string
): Promise<{ data: number[] }> {
  // Make sure we have an API key
  if (!apiKey) {
    console.error("Missing Gemini API key");
    throw new Error("Gemini API key is not configured");
  }

  console.log("Initializing Gemini with API key");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); // Using the stable model

  const movieContext = selectedMovies.length > 0 
    ? `Based on these movies: ${selectedMovies.map(m => m.title).join(', ')}\n`
    : '';

  const aiPrompt = `You are a movie recommendation expert. ${movieContext}
  Based on this input: ${input}
  
  Please suggest 6 highly relevant movies. Focus on popular, well-rated movies that match the preferences.
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
      
      console.log("Raw Gemini response:", text);
      
      // Extract array pattern from response
      const arrayMatch = text.match(/\[[\d,\s]+\]/);
      if (!arrayMatch) {
        throw new Error('Could not find array in Gemini response');
      }
      
      const movieIds = JSON.parse(arrayMatch[0]);
      if (!Array.isArray(movieIds) || movieIds.length === 0) {
        throw new Error('Invalid movie IDs array from Gemini');
      }

      console.log('Successfully received movie IDs:', movieIds);
      return { data: movieIds };
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * attempt;
        console.log(`Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Failed to get movie recommendations after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}
