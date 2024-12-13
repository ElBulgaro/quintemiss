import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('SHEETS_WEBHOOK_SECRET');
    
    const { sheetType, data, secret } = await req.json();
    
    if (secret !== webhookSecret) {
      throw new Error('Invalid webhook secret');
    }

    if (sheetType !== 'candidates' || !Array.isArray(data)) {
      throw new Error('Invalid data format');
    }

    console.log(`Processing ${data.length} candidates`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Keep track of which candidates had ranking changes
    let rankingChanged = false;

    for (const row of data) {
      try {
        // First try to find existing candidate by name and region
        const { data: existing, error: searchError } = await supabase
          .from('sheet_candidates')
          .select('id, ranking')
          .eq('name', row["Nom Complet"])
          .eq('region', row["Région"])
          .maybeSingle();

        if (searchError) {
          console.error(`Error searching for ${row["Nom Complet"]}:`, searchError);
          continue;
        }

        const newRanking = row["Classement"]?.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || 'inconnu';

        // Check if ranking changed
        if (existing?.ranking !== newRanking) {
          rankingChanged = true;
        }

        const candidate = {
          name: row["Nom Complet"],
          region: row["Région"],
          bio: row["Bio"],
          age: row["Age"],
          instagram: row["Instagram"],
          image_url: row["Photo URL (Maillot)"],
          official_photo_url: row["Photo URL (Costume)"],
          portrait_url: row["URL Portrait TF1"],
          ranking: newRanking,
          last_synced_at: new Date().toISOString(),
        };

        const { error: upsertError } = existing
          ? await supabase
              .from('sheet_candidates')
              .update(candidate)
              .eq('id', existing.id)
          : await supabase
              .from('sheet_candidates')
              .insert([candidate]);

        if (upsertError) {
          console.error(`Error processing ${candidate.name}:`, upsertError);
          throw upsertError;
        }
        
        console.log(`${existing ? 'Updated' : 'Inserted'} ${candidate.name}`);
      } catch (error) {
        console.error(`Error processing ${row["Nom Complet"]}:`, error);
      }
    }

    // If any rankings changed, manually trigger score recalculation
    if (rankingChanged) {
      try {
        // Get all predictions
        const { data: predictions, error: predictionsError } = await supabase
          .from('predictions')
          .select('user_id, predictions');

        if (predictionsError) throw predictionsError;

        // Get current rankings
        const { data: candidates, error: candidatesError } = await supabase
          .from('sheet_candidates')
          .select('id, ranking');

        if (candidatesError) throw candidatesError;

        // Calculate and save scores for each user
        for (const prediction of predictions) {
          let totalScore = 0;
          let perfectMatch = true;
          let positionMatches = 0;

          prediction.predictions.forEach((candidateId: string, index: number) => {
            const candidate = candidates.find(c => c.id === candidateId);
            if (!candidate) return;

            // Points for being in top 15
            if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5', 'top15'].includes(candidate.ranking)) {
              totalScore += 10;
            }

            // Points for being in top 5
            if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5'].includes(candidate.ranking)) {
              totalScore += 20;
            }

            // Points for correct position
            if (
              (candidate.ranking === 'miss_france' && index === 0) ||
              (candidate.ranking === '1ere_dauphine' && index === 1) ||
              (candidate.ranking === '2eme_dauphine' && index === 2) ||
              (candidate.ranking === '3eme_dauphine' && index === 3) ||
              (candidate.ranking === '4eme_dauphine' && index === 4)
            ) {
              totalScore += 50;
              positionMatches++;
            } else {
              perfectMatch = false;
            }

            // Winner bonus
            if (candidate.ranking === 'miss_france' && index === 0) {
              totalScore += 50;
            }
          });

          // Perfect match bonus
          if (perfectMatch && positionMatches === 5) {
            totalScore += 200;
          }

          // Update score
          const { error: scoreError } = await supabase
            .from('scores')
            .upsert({
              user_id: prediction.user_id,
              score: totalScore,
              perfect_match: perfectMatch && positionMatches === 5,
              scored_at: new Date().toISOString(),
            });

          if (scoreError) {
            console.error(`Error updating score for user ${prediction.user_id}:`, scoreError);
          }
        }
      } catch (error) {
        console.error('Error recalculating scores:', error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing sheet data:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
