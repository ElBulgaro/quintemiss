import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { sheetType, data, secret } = await req.json();

    const webhookSecret = Deno.env.get('SHEETS_WEBHOOK_SECRET');
    if (secret !== webhookSecret) {
      throw new Error('Invalid webhook secret');
    }

    console.log(`Received ${sheetType} update with ${data.length} records`);

    if (sheetType === 'candidates') {
      const candidatesForDb = data.map((candidate: any) => ({
        name: candidate["Nom Complet"],
        region: candidate["Région"],
        bio: candidate["Bio"],
        age: candidate["Age"] ? parseInt(candidate["Age"]) : null,
        instagram: candidate["Instagram"],
        image_url: candidate["Photo URL (Maillot)"],
        official_photo_url: candidate["Photo URL (Costume)"],
        portrait_url: candidate["URL Portrait TF1"] || null,
        ranking: candidate["Classement"]?.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || 'inconnu',
        last_synced_at: new Date().toISOString(),
      }));

      console.log('Mapped candidates data:', candidatesForDb);

      for (const candidate of candidatesForDb) {
        try {
          const { data: existingCandidate, error: findError } = await supabase
            .from('sheet_candidates')
            .select('id')
            .eq('name', candidate.name)
            .eq('region', candidate.region)
            .maybeSingle();

          if (findError) {
            console.error('Error finding existing candidate:', findError);
            throw findError;
          }

          if (existingCandidate) {
            const { error: updateError } = await supabase
              .from('sheet_candidates')
              .update(candidate)
              .eq('id', existingCandidate.id);

            if (updateError) {
              console.error('Error updating candidate:', updateError);
              throw updateError;
            }
            console.log(`Updated candidate: ${candidate.name} from ${candidate.region}`);
          } else {
            const { error: insertError } = await supabase
              .from('sheet_candidates')
              .insert([candidate]);

            if (insertError) {
              console.error('Error inserting new candidate:', insertError);
              throw insertError;
            }
            console.log(`Inserted new candidate: ${candidate.name} from ${candidate.region}`);
          }
        } catch (error) {
          console.error(`Error processing candidate ${candidate.name}:`, error);
          throw error;
        }
      }

      try {
        const { data: currentCandidates, error: getCurrentError } = await supabase
          .from('sheet_candidates')
          .select('id, name, region');

        if (getCurrentError) {
          console.error('Error getting current candidates:', getCurrentError);
          throw getCurrentError;
        }

        const { data: predictionItems, error: predictionError } = await supabase
          .from('prediction_items')
          .select('candidate_id');

        if (predictionError) {
          console.error('Error getting prediction items:', predictionError);
          throw predictionError;
        }

        const referencedCandidateIds = new Set(predictionItems?.map(item => item.candidate_id) || []);
        const newCandidateKeys = new Set(candidatesForDb.map(c => `${c.name}-${c.region}`));

        const candidatesToDelete = currentCandidates
          ?.filter(c => {
            const key = `${c.name}-${c.region}`;
            return !newCandidateKeys.has(key) && !referencedCandidateIds.has(c.id);
          })
          .map(c => c.id) || [];

        if (candidatesToDelete.length > 0) {
          console.log('Candidates to delete:', candidatesToDelete);
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
      } catch (error) {
        console.error('Error cleaning up old candidates:', error);
        throw error;
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