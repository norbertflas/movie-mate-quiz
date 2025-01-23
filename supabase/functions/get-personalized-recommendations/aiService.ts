import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

export async function getMovieRecommendations(formattedAnswers: string, apiKey: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const aiPrompt = `You are a movie recommendation expert. Based on these quiz answers:
  ${formattedAnswers}
  
  Please suggest 6 highly relevant movies. Focus on popular, well-rated movies that match the genre and mood preferences.
  Format your response as a JSON array of TMDB movie IDs only, like this: [123, 456, 789]
  Only include the JSON array in your response, no other text.`;

  console.log('Sending prompt to Gemini:', aiPrompt);

  let retries = 3;
  while (retries > 0) {
    try {
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
      console.error(`Attempt failed, ${retries - 1} retries left:`, error);
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed to get movie recommendations after all retries');
}