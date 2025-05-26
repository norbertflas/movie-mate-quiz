
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
  // Using gemini-pro instead of gemini-1.0-pro which doesn't exist
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const movieContext = selectedMovies.length > 0 
    ? `Based on these movies you liked: ${selectedMovies.map(m => m.title).join(', ')}\n`
    : '';

  const aiPrompt = `You are a movie recommendation expert. ${movieContext}
  Based on this input: ${input}
  
  Please suggest 6 highly relevant and popular movies from TMDB database. Focus on well-known movies that match the preferences.
  
  IMPORTANT: Respond with ONLY a JSON array of TMDB movie IDs, like this: [123, 456, 789, 101112, 131415, 161718]
  Do not include any other text, explanations, or formatting - just the array.`;

  console.log('Sending prompt to Gemini:', aiPrompt);

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${MAX_RETRIES}`);
      
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Raw Gemini response:", text);
      
      // Clean the response and extract array
      let cleanText = text.trim();
      
      // Remove any markdown formatting
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
      
      // Extract array pattern from response
      const arrayMatch = cleanText.match(/\[[\d,\s]+\]/);
      if (!arrayMatch) {
        throw new Error('Could not find valid movie IDs array in Gemini response');
      }
      
      const movieIds = JSON.parse(arrayMatch[0]);
      if (!Array.isArray(movieIds) || movieIds.length === 0) {
        throw new Error('Invalid movie IDs array from Gemini');
      }

      // Validate that all elements are numbers
      const validIds = movieIds.filter(id => typeof id === 'number' && id > 0);
      if (validIds.length === 0) {
        throw new Error('No valid movie IDs found in response');
      }

      console.log('Successfully received movie IDs:', validIds);
      return { data: validIds };
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
