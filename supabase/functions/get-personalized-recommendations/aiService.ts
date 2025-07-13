
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
  // Use gemini-1.5-flash which is more reliable than gemini-pro
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build context from selected movies
  const movieContext = selectedMovies.length > 0 
    ? `User has indicated they like these movies: ${selectedMovies.map(m => m.title).join(', ')}. Use this to understand their taste and recommend similar movies.\n`
    : '';

  // Create a more detailed and specific prompt
  const aiPrompt = `You are an expert movie recommendation system. Your task is to recommend 6 specific movies based on the user's request.

${movieContext}User request: "${input}"

IMPORTANT INSTRUCTIONS:
- Analyze the user's request carefully and recommend movies that specifically match their criteria
- If they mention a style (like "Wolf of Wall Street"), recommend movies with similar themes, tone, or genre
- If they mention specific genres, directors, actors, or themes, focus on those
- Recommend popular, well-known movies that have TMDB IDs
- Each recommendation should be different and relevant to the specific request
- Consider the language of the request (Polish/English) but recommend internationally known films

Respond with ONLY a JSON array of 6 TMDB movie IDs that match the user's specific request.
Format: [123, 456, 789, 101112, 131415, 161718]

Do not include any other text, explanations, or formatting - just the JSON array.`;

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
      
      // Remove any markdown formatting or extra text
      cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
      cleanText = cleanText.replace(/^[^[]*/, ''); // Remove text before first [
      cleanText = cleanText.replace(/[^\]]*$/, ']'); // Keep only until last ]
      
      // Extract array pattern from response
      const arrayMatch = cleanText.match(/\[[\d,\s]+\]/);
      if (!arrayMatch) {
        throw new Error('Could not find valid movie IDs array in Gemini response');
      }
      
      const movieIds = JSON.parse(arrayMatch[0]);
      if (!Array.isArray(movieIds) || movieIds.length === 0) {
        throw new Error('Invalid movie IDs array from Gemini');
      }

      // Validate that all elements are numbers and remove duplicates
      const validIds = [...new Set(movieIds.filter(id => typeof id === 'number' && id > 0))];
      if (validIds.length === 0) {
        throw new Error('No valid movie IDs found in response');
      }

      console.log('Successfully received movie IDs:', validIds);
      return { data: validIds.slice(0, 8) }; // Return up to 8 movies
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
