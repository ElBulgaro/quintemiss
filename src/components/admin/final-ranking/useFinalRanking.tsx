import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useFinalRanking() {
  const [isSaving, setIsSaving] = useState(false);

  const saveFinalRanking = async (finalRanking: string[], officialResultId: string) => {
    if (finalRanking.length !== 5) {
      toast.error("Please select exactly 5 candidates for the final ranking");
      return false;
    }

    try {
      setIsSaving(true);

      // Update the official results with the final ranking
      const { error: updateError } = await supabase
        .from('official_results')
        .update({
          final_ranking: finalRanking,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', officialResultId);

      if (updateError) throw updateError;

      toast.success("Official results have been saved!");
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