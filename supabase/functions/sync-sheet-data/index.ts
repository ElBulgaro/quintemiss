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

      // Get all existing candidates
      const { data: existingCandidates } = await supabase
        .from('sheet_candidates')
        .select('id, name, region');

      // Create a map of name+region to ID for existing candidates
      const existingCandidatesMap = new Map(
        existingCandidates?.map(c => [`${c.name}-${c.region}`, c.id]) || []
      );

      // Track which candidates we've processed
      const processedCandidates = new Set<string>();

      // Update or insert each candidate
      for (const candidate of candidatesForDb) {
        const key = `${candidate.name}-${candidate.region}`;
        const existingId = existingCandidatesMap.get(key);
        processedCandidates.add(key);
        
        if (existingId) {
          // Update existing candidate
          const { error: updateError } = await supabase
            .from('sheet_candidates')
            .update(candidate)
            .eq('id', existingId);

          if (updateError) {
            console.error('Error updating candidate:', updateError);
            throw updateError;
          }
        } else {
          // Insert new candidate
          const { error: insertError } = await supabase
            .from('sheet_candidates')
            .insert([candidate]);

          if (insertError) {
            console.error('Error inserting new candidate:', insertError);
            throw insertError;
          }
        }
      }

      // Delete candidates that no longer exist in the sheet
      // but preserve referenced candidates
      const candidatesToDelete = existingCandidates
        ?.filter(c => {
          const key = `${c.name}-${c.region}`;
          return !processedCandidates.has(key) && !referencedCandidateIds.has(c.id);
        })
        .map(c => c.id) || [];

      if (candidatesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('sheet_candidates')
          .delete()
          .in('id', candidatesToDelete);

        if (deleteError) {
          console.error('Error deleting outdated candidates:', deleteError);
          throw deleteError;
        }
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