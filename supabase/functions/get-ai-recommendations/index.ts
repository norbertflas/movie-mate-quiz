
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the API key from environment variable
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || "AIzaSyBPnyO6wZl7xI7sXA2PNODSUGZ_E0yH0eo";
    
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      throw new Error('GEMINI_API_KEY environment variable not found');
    }

    const { prompt, filters, language } = await req.json();
    
    console.log("Processing request with prompt:", prompt);
    console.log("Filters:", JSON.stringify(filters, null, 2));
    console.log("Language:", language);
    console.log("Using Gemini API key (first 5 chars):", GEMINI_API_KEY.substring(0, 5) + "...");

    // Initialize the Gemini API client with the latest version
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    let lastError = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${MAX_RETRIES}`);
        
        const platforms = filters?.platforms?.join(', ') || '';
        const promptWithContext = `You are a movie recommendation expert. A user is looking for movie recommendations with this request: "${prompt}"
        ${platforms ? `They have access to these streaming platforms: ${platforms}` : ''}
        
        Recommend 6 movies that match their request. Return ONLY the TMDB movie IDs in a JSON array format like this: [123, 456, 789, 101112, 131415, 161718]
        Focus on popular, well-rated movies that fit the request. If appropriate, include both classic and recent titles.`;
        
        console.log("Sending prompt to Gemini:", promptWithContext);
        
        const result = await model.generateContent(promptWithContext);
        const response = await result.response;
        const text = response.text();
        
        console.log("Raw Gemini response:", text);
        
        // Extract the array from the response
        let movieIds;
        try {
          // Find array pattern in the response
          const arrayMatch = text.match(/\[[\d,\s]+\]/);
          if (arrayMatch) {
            movieIds = JSON.parse(arrayMatch[0]);
          } else {
            throw new Error('Could not find array in response');
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          console.error('Raw response:', text);
          throw new Error('Failed to parse movie IDs from Gemini response');
        }
        
        if (!Array.isArray(movieIds) || movieIds.length === 0) {
          throw new Error('Invalid movie IDs array from Gemini');
        }
        
        console.log("Successfully received movie IDs:", movieIds);
        
        return new Response(
          JSON.stringify({ data: movieIds }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      } catch (retryError) {
        lastError = retryError;
        console.error(`Attempt ${attempt} failed:`, retryError);
        
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY * attempt;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
  } catch (error) {
    console.error('Error in get-ai-recommendations:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
