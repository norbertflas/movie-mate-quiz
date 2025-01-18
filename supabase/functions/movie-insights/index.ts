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

    const prompt = `Analyze the following movie and provide a structured analysis. Return ONLY a JSON object with no additional text or markdown formatting:
    Title: ${title}
    Description: ${description}
    Genre: ${genre}
    
    Include these keys in your JSON response:
    - themes (array of strings)
    - contentWarnings (array of strings)
    - similarMovies (array of strings)
    - targetAudience (string)
    - analysis (string)`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    try {
      // Parse the response text as JSON
      const insights = JSON.parse(text)
      
      return new Response(
        JSON.stringify(insights),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Error parsing AI response:', text)
      throw new Error('Invalid JSON response from AI')
    }
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