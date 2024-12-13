import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { sheetType, data, secret } = await req.json();

    // Verify webhook secret
    const webhookSecret = Deno.env.get('SHEETS_WEBHOOK_SECRET');
    if (secret !== webhookSecret) {
      throw new Error('Invalid webhook secret');
    }

    console.log(`Received ${sheetType} update with ${data.length} records`);

    if (sheetType === 'candidates') {
      // Map the incoming data
      const candidatesForDb = data.map((candidate: any) => ({
        name: candidate["Nom Complet"],
        region: candidate["Région"],
        bio: candidate["Bio"],
        age: parseInt(candidate["Age"]),
        instagram: candidate["Instagram"],
        image_url: candidate["Photo URL (Maillot)"],
        official_photo_url: candidate["Photo URL (Costume)"],
        portrait_url: candidate["URL Portrait TF1"] || null,
        ranking: candidate["Classement"]?.toLowerCase().replace(/[éè]/g, 'e').replace(/ /g, '_') || 'inconnu',
        last_synced_at: new Date().toISOString(),
      }));

      // Get all prediction items that reference sheet_candidates
      const { data: predictionItems } = await supabase
        .from('prediction_items')
        .select('candidate_id');

      // Get unique candidate IDs from prediction items
      const referencedCandidateIds = new Set(predictionItems?.map(item => item.candidate_id) || []);

      // Get existing candidates that are referenced in predictions
      const { data: existingCandidates } = await supabase
        .from('sheet_candidates')
        .select('id, name, region')
        .in('id', Array.from(referencedCandidateIds));

      // Create a map of name+region to ID for referenced candidates
      const referencedCandidatesMap = new Map(
        existingCandidates?.map(c => [`${c.name}-${c.region}`, c.id]) || []
      );

      // First, handle referenced candidates to maintain foreign key constraints
      for (const candidate of candidatesForDb) {
        const key = `${candidate.name}-${candidate.region}`;
        const existingId = referencedCandidatesMap.get(key);
        
        if (existingId) {
          // Update existing referenced candidate
          const { error: updateError } = await supabase
            .from('sheet_candidates')
            .update(candidate)
            .eq('id', existingId);

          if (updateError) {
            console.error('Error updating referenced candidate:', updateError);
            throw updateError;
          }
        }
      }

      // Now delete all non-referenced candidates
      const { error: deleteError } = await supabase
        .from('sheet_candidates')
        .delete()
        .not('id', 'in', `(${Array.from(referencedCandidateIds).map(id => `'${id}'`).join(',')})`);

      if (deleteError) {
        console.error('Error deleting non-referenced candidates:', deleteError);
        throw deleteError;
      }

      // Finally, insert all new candidates
      const { error: insertError } = await supabase
        .from('sheet_candidates')
        .insert(candidatesForDb);

      if (insertError) {
        console.error('Error inserting new candidates:', insertError);
        throw insertError;
      }

      console.log('Successfully synced all candidates');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing sheet data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});