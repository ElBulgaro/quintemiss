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

      try {
        // First get the user's most recent prediction
        const { data: predictions, error: predictionsError } = await supabase
          .from('predictions')
          .select('id, predictions')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (predictionsError) throw predictionsError;

        // If predictions exist, use them
        if (predictions && predictions.length > 0) {
          // Verify that all candidates still exist in sheet_candidates
          const { data: validCandidates, error: validationError } = await supabase
            .from('sheet_candidates')
            .select('id')
            .in('id', predictions[0].predictions);

          if (validationError) throw validationError;

          // Only use IDs that still exist in sheet_candidates
          const validIds = validCandidates.map(c => c.id);
          const filteredPredictions = predictions[0].predictions.filter(id => 
            validIds.includes(id)
          );

          setSelectedCandidates(filteredPredictions);
          localStorage.setItem('predictions', JSON.stringify(filteredPredictions));
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
        toast.error("Une erreur est survenue lors de la récupération de vos prédictions");
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
      return false;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Une erreur est survenue, veuillez vous reconnecter");
        return false;
      }

      // Verify that all selected candidates exist in sheet_candidates
      const { data: validCandidates, error: validationError } = await supabase
        .from('sheet_candidates')
        .select('id')
        .in('id', selectedCandidates);

      if (validationError) throw validationError;

      if (validCandidates.length !== selectedCandidates.length) {
        toast.error("Certaines candidates sélectionnées n'existent plus");
        return false;
      }

      // Create a new prediction entry
      const { data: prediction, error: predictionError } = await supabase
        .from('predictions')
        .insert({
          user_id: user.id,
          predictions: selectedCandidates,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (predictionError) throw predictionError;

      // Create prediction items for each candidate
      const predictionItems = selectedCandidates.map((candidateId, index) => ({
        prediction_id: prediction.id,
        candidate_id: candidateId,
        position: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from('prediction_items')
        .insert(predictionItems);

      if (itemsError) throw itemsError;
      
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