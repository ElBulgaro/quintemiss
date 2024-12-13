import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateScore } from '@/utils/calculateScore';

export const usePredictions = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSavedPredictions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const { data: predictions, error: predictionsError } = await supabase
          .from('predictions')
          .select('id, predictions')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (predictionsError) throw predictionsError;

        if (predictions && predictions.length > 0) {
          const { data: validCandidates, error: validationError } = await supabase
            .from('sheet_candidates')
            .select('id')
            .in('id', predictions[0].predictions);

          if (validationError) throw validationError;

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

  const calculateAndUpdateScore = async (userId: string, predictions: string[]) => {
    try {
      console.log('Calculating score for predictions:', predictions);
      
      // Get current rankings
      const { data: candidates, error: rankingsError } = await supabase
        .from('sheet_candidates')
        .select('id, ranking')
        .not('ranking', 'is', null);

      if (rankingsError) throw rankingsError;

      // Get final ranking order
      const finalRanking = ['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine']
        .map(rank => {
          const candidate = candidates.find(c => c.ranking === rank);
          return candidate ? candidate.id : null;
        })
        .filter((id): id is string => id !== null);

      // Get semi-finalists
      const semiFinalists = candidates
        .filter(c => ['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5', 'top15']
        .includes(c.ranking))
        .map(c => c.id);

      console.log('Final ranking:', finalRanking);
      console.log('Semi-finalists:', semiFinalists);

      // Calculate score
      const { score, perfectMatch } = calculateScore(predictions, finalRanking, semiFinalists);
      console.log('Calculated score:', score, 'Perfect match:', perfectMatch);

      // Save score
      const { error: scoreError } = await supabase
        .from('scores')
        .upsert({
          user_id: userId,
          score,
          perfect_match: perfectMatch,
          scored_at: new Date().toISOString(),
        });

      if (scoreError) throw scoreError;
      console.log('Score saved successfully');

    } catch (error) {
      console.error('Error calculating/saving score:', error);
      throw error;
    }
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

      // Save prediction
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

      // Create prediction items
      const predictionItems = selectedCandidates.map((candidateId, index) => ({
        prediction_id: prediction.id,
        candidate_id: candidateId,
        position: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from('prediction_items')
        .insert(predictionItems);

      if (itemsError) throw itemsError;

      // Calculate and update score
      await calculateAndUpdateScore(user.id, selectedCandidates);
      
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