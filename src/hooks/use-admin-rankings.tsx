import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

export type RankingType = 'TOP_15' | 'TOP_5' | 'FINAL';

export type RankingState = {
  [key: string]: {
    top15: boolean;
    top5: boolean;
    fourth: boolean;
    third: boolean;
    second: boolean;
    first: boolean;
    winner: boolean;
  };
};

export function useAdminRankings(candidates: Candidate[]) {
  const [rankings, setRankings] = useState<RankingState>(() => {
    const initial: RankingState = {};
    candidates.forEach(candidate => {
      initial[candidate.id] = {
        top15: false,
        top5: false,
        fourth: false,
        third: false,
        second: false,
        first: false,
        winner: false,
      };
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadExistingRankings();
    subscribeToRankingChanges();
  }, []);

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

  const subscribeToRankingChanges = () => {
    const channel = supabase
      .channel('rankings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rankings' },
        loadExistingRankings
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const saveRanking = async (
    candidateId: string,
    rankingType: RankingType,
    position?: number
  ) => {
    try {
      const { data: latestEvent } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) {
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
        latestEvent = newEvent;
      }

      const { error } = await supabase
        .from('rankings')
        .upsert({
          event_id: latestEvent.id,
          candidate_id: candidateId,
          ranking_type: rankingType,
          position,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving ranking:', error);
      throw error;
    }
  };

  const handleRankingChange = async (candidateId: string, field: keyof RankingState[string]) => {
    try {
      setIsSaving(true);
      const candidateRankings = { ...rankings[candidateId] };

      if (field === 'top15') {
        if (!candidateRankings.top15) {
          await saveRanking(candidateId, 'TOP_15');
          candidateRankings.top15 = true;
        } else {
          await clearCandidateRankings(candidateId);
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
          await saveRanking(candidateId, 'TOP_5');
          candidateRankings.top5 = true;
        } else {
          await clearCandidateRankings(candidateId, ['TOP_5', 'FINAL']);
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
          await saveRanking(candidateId, 'FINAL', position);
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

  const clearCandidateRankings = async (
    candidateId: string, 
    rankingTypes?: RankingType[]
  ) => {
    try {
      const { data: latestEvent } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) return;

      let query = supabase
        .from('rankings')
        .delete()
        .eq('event_id', latestEvent.id)
        .eq('candidate_id', candidateId);

      if (rankingTypes) {
        query = query.in('ranking_type', rankingTypes);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (error) {
      console.error('Error clearing rankings:', error);
      throw error;
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
    rankings,
    isSaving,
    isClearing,
    handleRankingChange,
    clearAllRankings,
  };
}