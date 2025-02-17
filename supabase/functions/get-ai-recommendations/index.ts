
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, filters } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Processing request with prompt:', prompt);
    console.log('Filters:', filters);

    // Format the system prompt
    const systemPrompt = `Act as a movie recommendation expert. Based on the user's request: "${prompt}" and considering these filters: ${JSON.stringify(filters)}, recommend exactly 5 movies that best match their preferences.

For each movie, provide:
1. The exact movie title
2. A clear explanation of why it matches their preferences

Structure your response as a valid JSON object like this:
{
  "recommendations": [
    {
      "title": "Exact Movie Title",
      "reason": "Clear explanation of why this movie matches their preferences"
    }
  ]
}

Important:
- Recommend exactly 5 movies
- Make sure the JSON is valid
- Each movie must have both a title and reason
- Keep the reasons concise but informative`;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API raw response:', JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Extracted response text:', responseText);

    try {
      const parsedRecommendations = JSON.parse(responseText);
      
      if (!Array.isArray(parsedRecommendations.recommendations) || 
          parsedRecommendations.recommendations.length !== 5) {
        throw new Error('Invalid recommendations format');
      }

      // Validate each recommendation
      parsedRecommendations.recommendations.forEach((rec: any, index: number) => {
        if (!rec.title || !rec.reason) {
          throw new Error(`Missing title or reason in recommendation ${index + 1}`);
        }
      });

      return new Response(
        JSON.stringify(parsedRecommendations),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response text:', responseText);
      throw new Error('Failed to parse movie recommendations');
    }
  } catch (error) {
    console.error('Error in get-ai-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
