import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { Button } from '@/components/ui/button';

export default function ProcessImages() {
  const [status, setStatus] = useState('En attente...');
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const processBackgrounds = async () => {
    setIsProcessing(true);
    setLogs([]);
    addLog('🎨 Démarrage du traitement...');

    const { data: candidates, error } = await supabase
      .from('sheet_candidates')
      .select('id, name, image_url, transparent_photo_url')
      .is('transparent_photo_url', null)
      .not('image_url', 'is', null);

    if (error) {
      addLog(`❌ Erreur: ${error.message}`);
      setStatus('Erreur');
      setIsProcessing(false);
      return;
    }

    if (!candidates || candidates.length === 0) {
      addLog('✅ Toutes les candidates ont déjà des photos transparentes!');
      setStatus('Terminé');
      setIsProcessing(false);
      return;
    }

    setProgress({ done: 0, total: candidates.length });
    addLog(`📋 ${candidates.length} candidates à traiter`);

    let processed = 0;
    let failed = 0;

    for (const candidate of candidates) {
      const startTime = Date.now();
      setStatus(`Traitement ${processed + 1}/${candidates.length}: ${candidate.name}...`);

      try {
        if (!candidate.image_url) {
          addLog(`⚠️ ${candidate.name} - pas d'image`);
          continue;
        }

        const img = await loadImage(candidate.image_url);
        const transparentBlob = await removeBackground(img);

        const fileName = `transparent/${candidate.id}.png`;
        const { error: uploadError } = await supabase.storage
          .from('candidates')
          .upload(fileName, transparentBlob, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) throw new Error(`Upload: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from('candidates')
          .getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from('sheet_candidates')
          .update({ transparent_photo_url: urlData.publicUrl })
          .eq('id', candidate.id);

        if (updateError) throw new Error(`DB: ${updateError.message}`);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        processed++;
        setProgress({ done: processed, total: candidates.length });
        addLog(`✅ ${candidate.name} (${duration}s)`);

      } catch (err) {
        failed++;
        addLog(`❌ ${candidate.name}: ${err instanceof Error ? err.message : 'Erreur'}`);
      }
    }

    setStatus(`Terminé! ${processed} réussies, ${failed} échecs`);
    addLog(`\n🎉 Terminé! ${processed}/${candidates.length} traitées`);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold text-center">🎨 Traitement des images</h1>
        
        <div className="text-center text-muted-foreground">
          {status}
        </div>

        {progress.total > 0 && (
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}

        <Button 
          onClick={processBackgrounds} 
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Traitement en cours...' : 'Lancer le traitement'}
        </Button>

        <div className="bg-muted/50 rounded-lg p-3 h-64 overflow-y-auto text-sm font-mono">
          {logs.length === 0 ? (
            <span className="text-muted-foreground">Les logs apparaîtront ici...</span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
