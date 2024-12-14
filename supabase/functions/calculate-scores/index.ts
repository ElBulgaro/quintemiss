import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('User ID is required')
    }

    console.log(`Calculating score for user ${user_id}`)

    // Get user's prediction
    const { data: prediction, error: predictionError } = await supabase
      .from('predictions')
      .select('predictions')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (predictionError) throw predictionError

    // Get rankings for predicted candidates
    const { data: candidates, error: candidatesError } = await supabase
      .from('sheet_candidates')
      .select('id, ranking')
      .in('id', prediction.predictions)

    if (candidatesError) throw candidatesError

    // Calculate score
    let totalScore = 0
    let positionMatches = 0
    let perfectMatch = false

    prediction.predictions.forEach((candidateId: string, index: number) => {
      const candidate = candidates.find(c => c.id === candidateId)
      if (!candidate) return

      // Points for top 15
      if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5', 'top15'].includes(candidate.ranking)) {
        totalScore += 10
      }

      // Points for top 5
      if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5'].includes(candidate.ranking)) {
        totalScore += 20
      }

      // Points for correct position
      if (
        (candidate.ranking === 'miss_france' && index === 0) ||
        (candidate.ranking === '1ere_dauphine' && index === 1) ||
        (candidate.ranking === '2eme_dauphine' && index === 2) ||
        (candidate.ranking === '3eme_dauphine' && index === 3) ||
        (candidate.ranking === '4eme_dauphine' && index === 4)
      ) {
        totalScore += 50
        positionMatches++
      }

      // Winner bonus
      if (candidate.ranking === 'miss_france' && index === 0) {
        totalScore += 50
      }
    })

    // Perfect match bonus
    if (positionMatches === 5) {
      perfectMatch = true
      totalScore += 200
    }

    console.log(`Score calculated for user ${user_id}: ${totalScore} points (Perfect match: ${perfectMatch})`)

    // Update score using upsert
    const { error: scoreError } = await supabase
      .from('scores')
      .upsert({
        user_id,
        score: totalScore,
        perfect_match: perfectMatch,
        scored_at: new Date().toISOString(),
      })

    if (scoreError) throw scoreError

    return new Response(
      JSON.stringify({ success: true, score: totalScore, perfect_match: perfectMatch }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error calculating score:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})