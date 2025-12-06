import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching candidates from database...');
    
    // Fetch all candidates
    const { data: candidates, error: fetchError } = await supabase
      .from('sheet_candidates')
      .select('id, name, region, image_url, official_photo_url, portrait_url');

    if (fetchError) {
      console.error('Error fetching candidates:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${candidates?.length} candidates`);

    const results: { id: string; success: boolean; error?: string; newUrl?: string }[] = [];

    for (const candidate of candidates || []) {
      const imageUrl = candidate.image_url;
      
      if (!imageUrl) {
        console.log(`Skipping ${candidate.id} - no image URL`);
        results.push({ id: candidate.id, success: false, error: 'No image URL' });
        continue;
      }

      // Skip if already migrated to our storage
      if (imageUrl.includes('supabase.co/storage')) {
        console.log(`Skipping ${candidate.id} - already migrated`);
        results.push({ id: candidate.id, success: true, newUrl: imageUrl });
        continue;
      }

      try {
        console.log(`Downloading image for ${candidate.id} from ${imageUrl}`);
        
        // Download the image
        const imageResponse = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!imageResponse.ok) {
          throw new Error(`Failed to download: ${imageResponse.status}`);
        }

        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Determine file extension from content type
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : 'jpg';
        
        // Create filename: miss-{id}.jpg
        const filename = `miss-${candidate.id}.${extension}`;

        console.log(`Uploading ${filename} to storage...`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('candidates')
          .upload(filename, uint8Array, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('candidates')
          .getPublicUrl(filename);

        const newImageUrl = publicUrlData.publicUrl;

        console.log(`Updating database for ${candidate.id} with new URL: ${newImageUrl}`);

        // Update the candidate's image_url in database
        const { error: updateError } = await supabase
          .from('sheet_candidates')
          .update({ image_url: newImageUrl })
          .eq('id', candidate.id);

        if (updateError) {
          throw updateError;
        }

        results.push({ id: candidate.id, success: true, newUrl: newImageUrl });
        console.log(`Successfully migrated ${candidate.id}`);

      } catch (error) {
        console.error(`Error processing ${candidate.id}:`, error);
        results.push({ 
          id: candidate.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Migration complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: `Migration complete: ${successCount} success, ${failCount} failed`,
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
