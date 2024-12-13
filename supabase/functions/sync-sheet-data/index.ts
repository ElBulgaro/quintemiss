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
        age: candidate["Age"] ? parseInt(candidate["Age"]) : null,
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

      // Process each candidate
      for (const candidate of candidatesForDb) {
        // First try to find an existing candidate by name and region
        const { data: existingCandidates, error: findError } = await supabase
          .from('sheet_candidates')
          .select('id, name, region')
          .eq('name', candidate.name)
          .eq('region', candidate.region);

        if (findError) {
          console.error('Error finding existing candidate:', findError);
          throw findError;
        }

        if (existingCandidates && existingCandidates.length > 0) {
          // Update existing candidate
          const { error: updateError } = await supabase
            .from('sheet_candidates')
            .update(candidate)
            .eq('id', existingCandidates[0].id);

          if (updateError) {
            console.error('Error updating candidate:', updateError);
            throw updateError;
          }
          console.log(`Updated candidate: ${candidate.name} from ${candidate.region}`);
        } else {
          // Insert new candidate
          const { error: insertError } = await supabase
            .from('sheet_candidates')
            .insert([candidate]);

          if (insertError) {
            console.error('Error inserting new candidate:', insertError);
            throw insertError;
          }
          console.log(`Inserted new candidate: ${candidate.name} from ${candidate.region}`);
        }
      }

      // Get all current candidates after updates
      const { data: currentCandidates, error: getCurrentError } = await supabase
        .from('sheet_candidates')
        .select('id, name, region');

      if (getCurrentError) {
        console.error('Error getting current candidates:', getCurrentError);
        throw getCurrentError;
      }

      // Find candidates to delete (not in new data and not referenced)
      const newCandidateKeys = new Set(candidatesForDb.map(c => `${c.name}-${c.region}`));
      const candidatesToDelete = currentCandidates
        ?.filter(c => {
          const key = `${c.name}-${c.region}`;
          return !newCandidateKeys.has(key) && !referencedCandidateIds.has(c.id);
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
        console.log(`Deleted ${candidatesToDelete.length} outdated candidates`);
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