import { supabase } from '@/integrations/supabase/client';
import { removeBackground, loadImage } from './backgroundRemoval';

export async function processAllCandidateBackgrounds() {
  console.log('🎨 Starting background removal process...');
  
  // Fetch candidates without transparent_photo_url
  const { data: candidates, error } = await supabase
    .from('sheet_candidates')
    .select('id, name, image_url, transparent_photo_url')
    .is('transparent_photo_url', null)
    .not('image_url', 'is', null);
  
  if (error) {
    console.error('❌ Failed to fetch candidates:', error);
    return;
  }
  
  if (!candidates || candidates.length === 0) {
    console.log('✅ All candidates already have transparent photos!');
    return;
  }
  
  console.log(`📋 Found ${candidates.length} candidates to process`);
  
  let processed = 0;
  let failed = 0;
  
  for (const candidate of candidates) {
    const startTime = Date.now();
    try {
      console.log(`🔄 Processing ${processed + 1}/${candidates.length}: ${candidate.name}...`);
      
      if (!candidate.image_url) {
        console.log(`⚠️ Skipping ${candidate.name} - no image_url`);
        continue;
      }
      
      // Load the image
      const img = await loadImage(candidate.image_url);
      
      // Remove background
      const transparentBlob = await removeBackground(img);
      
      // Upload to storage
      const fileName = `transparent/${candidate.id}.png`;
      const { error: uploadError } = await supabase.storage
        .from('candidates')
        .upload(fileName, transparentBlob, {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('candidates')
        .getPublicUrl(fileName);
      
      // Update database
      const { error: updateError } = await supabase
        .from('sheet_candidates')
        .update({ transparent_photo_url: urlData.publicUrl })
        .eq('id', candidate.id);
      
      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      processed++;
      console.log(`✅ ${processed}/${candidates.length}: ${candidate.name} - Done (${duration}s)`);
      
    } catch (err) {
      failed++;
      console.error(`❌ Failed to process ${candidate.name}:`, err);
    }
  }
  
  console.log(`\n🎉 Complete! ${processed}/${candidates.length} processed, ${failed} failed`);
}

// Export for console access
(window as any).processBackgrounds = processAllCandidateBackgrounds;
