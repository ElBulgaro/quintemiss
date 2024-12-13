import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateScore } from "@/utils/calculateScore";

export function useFinalRanking() {
  const [isSaving, setIsSaving] = useState(false);

  const saveFinalRanking = async (
    finalRanking: string[],
    officialResultId: string
  ) => {
    if (finalRanking.length !== 5) {
      toast.error("Please select exactly 5 candidates for the final ranking");
      return false;
    }

    try {
      setIsSaving(true);

      // Create final ranking entries in the rankings table
      const rankingItems = finalRanking.map((candidateId, index) => ({
        event_id: officialResultId,
        candidate_id: candidateId,
        ranking_type: 'FINAL',
        position: index,
      }));

      const { error: rankingError } = await supabase
        .from('rankings')
        .insert(rankingItems);

      if (rankingError) throw rankingError;

      // Get all user predictions
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('user_id, predictions');

      if (predictionsError) throw predictionsError;

      // Calculate and save scores for each user using upsert
      const scorePromises = predictions.map(async (prediction) => {
        const { score, perfectMatch } = calculateScore(prediction.predictions, finalRanking);
        
        return supabase
          .from('scores')
          .upsert({
            user_id: prediction.user_id,
            score,
            perfect_match: perfectMatch,
            official_result_id: officialResultId,
            scored_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });
      });

      await Promise.all(scorePromises);

      toast.success("Official results and scores have been saved!");
      return true;
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error("Failed to save results");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveFinalRanking,
  };
}