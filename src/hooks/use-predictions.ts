import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePredictions = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSavedPredictions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: predictions } = await supabase
        .from('predictions')
        .select('predictions')
        .eq('user_id', session.user.id);

      // If predictions exist, use the first one (most recent)
      if (predictions && predictions.length > 0) {
        setSelectedCandidates(predictions[0].predictions);
        localStorage.setItem('predictions', JSON.stringify(predictions[0].predictions));
      }
    };

    fetchSavedPredictions();
  }, []);

  const updatePredictions = (predictions: string[]) => {
    setSelectedCandidates(predictions);
    localStorage.setItem('predictions', JSON.stringify(predictions));
  };

  const clearPredictions = () => {
    localStorage.removeItem('predictions');
    setSelectedCandidates([]);
  };

  const savePredictions = async () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner exactement 5 candidates");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Une erreur est survenue, veuillez vous reconnecter");
        return;
      }

      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: user.id,
          predictions: selectedCandidates,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success("🎉 Prédictions enregistrées!", {
        description: "Rendez-vous sur le leaderboard pour voir votre classement!"
      });
      
      return true;
    } catch (error) {
      console.error('Error saving predictions:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedCandidates,
    isSubmitting,
    updatePredictions,
    clearPredictions,
    savePredictions
  };
};