import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RankingState } from "./use-rankings-state";
import type { Candidate } from "@/data/types";

export function useRankingsOperations(
  candidates: Candidate[],
  rankings: RankingState,
  setRankings: (rankings: RankingState) => void,
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

      const newRankings: RankingState = { ...rankings };
      
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

      // Get or create event
      const { data: existingEvent } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let eventId: string;

      if (!existingEvent) {
        const { data: newEvent, error: eventError } = await supabase
          .from('official_results')
          .insert({
            semi_finalists: [],
            final_ranking: [],
            top_5: [],
            ordered_ranking: [],
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (eventError) throw eventError;
        eventId = newEvent.id;
      } else {
        eventId = existingEvent.id;
      }

      if (field === 'top15') {
        if (!candidateRankings.top15) {
          await supabase
            .from('rankings')
            .insert({
              event_id: eventId,
              candidate_id: candidateId,
              ranking_type: 'TOP_15',
            });
          candidateRankings.top15 = true;
        } else {
          await supabase
            .from('rankings')
            .delete()
            .eq('event_id', eventId)
            .eq('candidate_id', candidateId);
          candidateRankings.top15 = false;
          candidateRankings.top5 = false;
          candidateRankings.fourth = false;
          candidateRankings.third = false;
          candidateRankings.second = false;
          candidateRankings.first = false;
          candidateRankings.winner = false;
        }
      } else if (field === 'top5') {
        if (!candidateRankings.top5) {
          if (!candidateRankings.top15) {
            toast.error("Candidate must be in TOP 15 first");
            return;
          }
          await supabase
            .from('rankings')
            .insert({
              event_id: eventId,
              candidate_id: candidateId,
              ranking_type: 'TOP_5',
            });
          candidateRankings.top5 = true;
        } else {
          await supabase
            .from('rankings')
            .delete()
            .eq('event_id', eventId)
            .eq('candidate_id', candidateId)
            .in('ranking_type', ['TOP_5', 'FINAL']);
          candidateRankings.top5 = false;
          candidateRankings.fourth = false;
          candidateRankings.third = false;
          candidateRankings.second = false;
          candidateRankings.first = false;
          candidateRankings.winner = false;
        }
      } else {
        if (!candidateRankings.top5) {
          toast.error("Candidate must be in TOP 5 first");
          return;
        }

        const position = getFinalPosition(field);
        if (position !== undefined) {
          await supabase
            .from('rankings')
            .upsert({
              event_id: eventId,
              candidate_id: candidateId,
              ranking_type: 'FINAL',
              position,
            });
          candidateRankings[field] = !candidateRankings[field];
        }
      }

      setRankings(prev => ({
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

  const getFinalPosition = (field: keyof RankingState[string]): number | undefined => {
    switch (field) {
      case 'winner': return 0;
      case 'first': return 1;
      case 'second': return 2;
      case 'third': return 3;
      case 'fourth': return 4;
      default: return undefined;
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
