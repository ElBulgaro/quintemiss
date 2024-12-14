import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username } = await req.json()
    console.log('Received username for moderation:', username)

    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: username,
      }),
    })

    const data = await response.json()
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2))
    
    // If any category is flagged, the username is inappropriate
    const isInappropriate = data.results[0].flagged
    const categories = data.results[0].categories
    const scores = data.results[0].category_scores

    console.log('Moderation result:', {
      username,
      isInappropriate,
      flaggedCategories: Object.entries(categories)
        .filter(([_, value]) => value)
        .map(([key]) => key),
      highestScores: Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key, value]) => `${key}: ${(value * 100).toFixed(2)}%`)
    })

    return new Response(
      JSON.stringify({ 
        isInappropriate,
        categories: data.results[0].categories,
        scores: data.results[0].category_scores 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in moderation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})