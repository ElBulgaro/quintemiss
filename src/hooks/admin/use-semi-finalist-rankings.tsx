import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

export function useSemiFinalistRankings() {
  const [isSaving, setIsSaving] = useState(false);

  const saveRanking = async (candidateId: string, eventId: string) => {
    try {
      const { error } = await supabase
        .from('rankings')
        .insert({
          event_id: eventId,
          candidate_id: candidateId,
          ranking_type: 'TOP_15',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving ranking:', error);
      throw error;
    }
  };

  const removeRanking = async (candidateId: string, eventId: string) => {
    try {
      const { error } = await supabase
        .from('rankings')
        .delete()
        .eq('event_id', eventId)
        .eq('candidate_id', candidateId)
        .eq('ranking_type', 'TOP_15');

      if (error) throw error;
    } catch (error) {
      console.error('Error removing ranking:', error);
      throw error;
    }
  };

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
        .select('id')
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

      // Update rankings table
      if (currentSemiFinalists.includes(candidateId)) {
        await removeRanking(candidateId, eventId);
      } else if (currentSemiFinalists.length < 15) {
        await saveRanking(candidateId, eventId);
      } else {
        toast.error("Maximum 15 semi-finalists allowed");
        return null;
      }

      // Keep official_results in sync for backward compatibility
      const updatedSemiFinalists = currentSemiFinalists.includes(candidateId)
        ? currentSemiFinalists.filter(id => id !== candidateId)
        : [...currentSemiFinalists, candidateId];

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
