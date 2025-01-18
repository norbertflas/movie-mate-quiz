import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from '@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, description, genre } = await req.json()
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Analyze the following movie:
    Title: ${title}
    Description: ${description}
    Genre: ${genre}
    
    Provide a structured analysis with:
    1. Main themes
    2. Content warnings
    3. Similar movies recommendations
    4. Target audience
    5. Brief critical analysis
    
    Format the response as a JSON object with these keys: themes, contentWarnings, similarMovies, targetAudience, analysis`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // Parse the JSON response
    const insights = JSON.parse(text)

    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating movie insights:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})