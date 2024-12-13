import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RankingState } from "./use-rankings-state";
import type { Candidate } from "@/data/types";

export function useRankingsOperations(
  candidates: Candidate[],
  rankings: RankingState,
  setRankings: (rankings: RankingState | ((prev: RankingState) => RankingState)) => void,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const loadExistingRankings = async () => {
    try {
      const { data: latestEvent } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) return;

      const { data: existingRankings, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('event_id', latestEvent.id);

      if (error) throw error;

      const newRankings = { ...rankings };
      
      existingRankings.forEach(ranking => {
        if (!newRankings[ranking.candidate_id]) return;

        switch (ranking.ranking_type) {
          case 'TOP_15':
            newRankings[ranking.candidate_id].top15 = true;
            break;
          case 'TOP_5':
            newRankings[ranking.candidate_id].top5 = true;
            break;
          case 'FINAL':
            switch (ranking.position) {
              case 0:
                newRankings[ranking.candidate_id].winner = true;
                break;
              case 1:
                newRankings[ranking.candidate_id].first = true;
                break;
              case 2:
                newRankings[ranking.candidate_id].second = true;
                break;
              case 3:
                newRankings[ranking.candidate_id].third = true;
                break;
              case 4:
                newRankings[ranking.candidate_id].fourth = true;
                break;
            }
            break;
        }
      });

      setRankings(newRankings);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast.error("Failed to load existing rankings");
    }
  };

  const handleRankingChange = async (candidateId: string, field: keyof RankingState[string]) => {
    try {
      setIsSaving(true);
      const candidateRankings = { ...rankings[candidateId] };

      // Get latest event
      const { data: latestEvent } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) {
        throw new Error('No event found');
      }

      const { error } = await supabase
        .from('rankings')
        .upsert({
          event_id: latestEvent.id,
          candidate_id: candidateId,
          ranking_type: field === 'top15' ? 'TOP_15' : field === 'top5' ? 'TOP_5' : 'FINAL',
          position: field === 'winner' ? 0 : field === 'first' ? 1 : field === 'second' ? 2 : field === 'third' ? 3 : field === 'fourth' ? 4 : undefined,
        }, {
          onConflict: 'event_id,candidate_id,ranking_type'
        });

      if (error) throw error;

      if (field === 'top15') {
        candidateRankings.top15 = !candidateRankings.top15;
        if (!candidateRankings.top15) {
          candidateRankings.top5 = false;
          candidateRankings.fourth = false;
          candidateRankings.third = false;
          candidateRankings.second = false;
          candidateRankings.first = false;
          candidateRankings.winner = false;
        }
      } else if (field === 'top5') {
        candidateRankings.top5 = !candidateRankings.top5;
        if (!candidateRankings.top5) {
          candidateRankings.fourth = false;
          candidateRankings.third = false;
          candidateRankings.second = false;
          candidateRankings.first = false;
          candidateRankings.winner = false;
        }
      } else {
        candidateRankings[field] = !candidateRankings[field];
      }

      setRankings((prev: RankingState) => ({
        ...prev,
        [candidateId]: candidateRankings
      }));

      toast.success("Ranking updated successfully");
    } catch (error) {
      console.error('Error updating ranking:', error);
      toast.error("Failed to update ranking");
    } finally {
      setIsSaving(false);
    }
  };

  const clearAllRankings = async () => {
    try {
      setIsClearing(true);
      
      const { data: latestEvent } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) return;

      const { error } = await supabase
        .from('rankings')
        .delete()
        .eq('event_id', latestEvent.id);

      if (error) throw error;

      const clearedRankings: RankingState = {};
      candidates.forEach(candidate => {
        clearedRankings[candidate.id] = {
          top15: false,
          top5: false,
          fourth: false,
          third: false,
          second: false,
          first: false,
          winner: false,
        };
      });
      setRankings(clearedRankings);
      
      toast.success("All rankings have been cleared");
    } catch (error) {
      console.error('Error clearing rankings:', error);
      toast.error("Failed to clear rankings");
    } finally {
      setIsClearing(false);
    }
  };

  return {
    isSaving,
    isClearing,
    loadExistingRankings,
    handleRankingChange,
    clearAllRankings,
  };
}
