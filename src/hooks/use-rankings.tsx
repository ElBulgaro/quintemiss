import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

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

export function useRankings(candidates: Candidate[]) {
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
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) return;

      const newRankings: RankingState = { ...rankings };
      
      // Set top 15
      latestEvent.semi_finalists.forEach((candidateId: string) => {
        if (newRankings[candidateId]) {
          newRankings[candidateId].top15 = true;
        }
      });

      // Set top 5 from final_ranking
      latestEvent.final_ranking.slice(0, 5).forEach((candidateId: string) => {
        if (newRankings[candidateId]) {
          newRankings[candidateId].top5 = true;
        }
      });

      // Set final positions
      latestEvent.final_ranking.forEach((candidateId: string, index: number) => {
        if (newRankings[candidateId]) {
          switch (index) {
            case 0:
              newRankings[candidateId].winner = true;
              break;
            case 1:
              newRankings[candidateId].first = true;
              break;
            case 2:
              newRankings[candidateId].second = true;
              break;
            case 3:
              newRankings[candidateId].third = true;
              break;
            case 4:
              newRankings[candidateId].fourth = true;
              break;
          }
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
        { event: '*', schema: 'public', table: 'official_results' },
        loadExistingRankings
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRankingChange = async (candidateId: string, field: keyof RankingState[string]) => {
    try {
      setIsSaving(true);
      const { data: latestEvent } = await supabase
        .from('official_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestEvent) {
        throw new Error('No event found');
      }

      let updatedEvent = { ...latestEvent };

      if (field === 'top15') {
        const newSemiFinalists = rankings[candidateId].top15
          ? latestEvent.semi_finalists.filter(id => id !== candidateId)
          : [...latestEvent.semi_finalists, candidateId];
        updatedEvent.semi_finalists = newSemiFinalists;
      } else if (field === 'top5') {
        const currentTop5 = latestEvent.final_ranking.slice(0, 5);
        const newTop5 = rankings[candidateId].top5
          ? currentTop5.filter(id => id !== candidateId)
          : [...currentTop5, candidateId].slice(0, 5);
        // Preserve the rest of final_ranking
        updatedEvent.final_ranking = [...newTop5, ...latestEvent.final_ranking.slice(5)];
      } else {
        // Handle final positions
        const position = ['winner', 'first', 'second', 'third', 'fourth'].indexOf(field);
        if (position !== -1) {
          const newFinalRanking = [...latestEvent.final_ranking];
          newFinalRanking[position] = candidateId;
          updatedEvent.final_ranking = newFinalRanking;
        }
      }

      const { error } = await supabase
        .from('official_results')
        .update(updatedEvent)
        .eq('id', latestEvent.id);

      if (error) throw error;

      await loadExistingRankings();
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
        .from('official_results')
        .update({
          semi_finalists: [],
          final_ranking: [],
          submitted_at: new Date().toISOString(),
        })
        .eq('id', latestEvent.id);

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
    rankings,
    isSaving,
    isClearing,
    handleRankingChange,
    clearAllRankings,
  };
}