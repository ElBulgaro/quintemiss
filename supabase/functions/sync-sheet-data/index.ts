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

    const candidates = data.map(row => ({
      name: row["Nom Complet"],
      region: row["Région"],
      bio: row["Bio"],
      age: row["Age"],
      instagram: row["Instagram"],
      image_url: row["Photo URL (Maillot)"],
      official_photo_url: row["Photo URL (Costume)"],
      portrait_url: row["URL Portrait TF1"],
      ranking: row["Classement"]?.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'inconnu',
      last_synced_at: new Date().toISOString(),
    }));

    for (const candidate of candidates) {
      const { data: existing } = await supabase
        .from('sheet_candidates')
        .select('id')
        .eq('name', candidate.name)
        .eq('region', candidate.region)
        .maybeSingle();

      const { error } = existing
        ? await supabase
            .from('sheet_candidates')
            .update(candidate)
            .eq('id', existing.id)
        : await supabase
            .from('sheet_candidates')
            .insert([candidate]);

      if (error) {
        console.error(`Error processing ${candidate.name}:`, error);
        throw error;
      }
      
      console.log(`${existing ? 'Updated' : 'Inserted'} ${candidate.name}`);
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