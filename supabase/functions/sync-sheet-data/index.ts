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

    console.log(`Received ${sheetType} update:`, data);

    if (sheetType === 'candidates') {
      // Get existing candidates to determine which ones to update vs insert
      const { data: existingCandidates, error: fetchError } = await supabase
        .from('sheet_candidates')
        .select('id, name, region');

      if (fetchError) throw fetchError;

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

      // Update existing candidates
      for (const candidate of candidatesForDb) {
        const existingCandidate = existingCandidates?.find(
          (ec) => ec.name === candidate.name && ec.region === candidate.region
        );

        if (existingCandidate) {
          // Update existing candidate
          const { error: updateError } = await supabase
            .from('sheet_candidates')
            .update(candidate)
            .eq('id', existingCandidate.id);

          if (updateError) throw updateError;
        } else {
          // Insert new candidate
          const { error: insertError } = await supabase
            .from('sheet_candidates')
            .insert([candidate]);

          if (insertError) throw insertError;
        }
      }
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