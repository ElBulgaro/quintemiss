import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

export function useSemiFinalistRankings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSemiFinalist = async (
    candidateId: string,
    currentSemiFinalists: string[],
    isAdmin: boolean
  ) => {
    if (!isAdmin) {
      toast.error("Only administrators can modify semi-finalists");
      return null;
    }

    try {
      setIsSaving(true);

      // Get or create event
      const { data: existingEvent } = await supabase
        .from('official_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let eventId = existingEvent?.id;

      if (!eventId) {
        const { data: newEvent, error: eventError } = await supabase
          .from('official_results')
          .insert({
            semi_finalists: [],
            final_ranking: [],
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (eventError) throw eventError;
        eventId = newEvent.id;
      }

      // Update semi-finalists array
      const updatedSemiFinalists = currentSemiFinalists.includes(candidateId)
        ? currentSemiFinalists.filter(id => id !== candidateId)
        : [...currentSemiFinalists, candidateId];

      if (updatedSemiFinalists.length > 15) {
        toast.error("Maximum 15 semi-finalists allowed");
        return null;
      }

      const { error: updateError } = await supabase
        .from('official_results')
        .update({
          semi_finalists: updatedSemiFinalists,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (updateError) throw updateError;

      return updatedSemiFinalists;
    } catch (error: any) {
      console.error('Error toggling semi-finalist:', error);
      toast.error(error.message || "Failed to save selection");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleToggleSemiFinalist,
  };
}
