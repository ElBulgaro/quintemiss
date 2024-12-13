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
      // Update candidates
      const { error: deleteError } = await supabase
        .from('sheet_candidates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

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
      }));

      const { error: insertError } = await supabase
        .from('sheet_candidates')
        .insert(candidatesForDb);

      if (insertError) throw insertError;
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