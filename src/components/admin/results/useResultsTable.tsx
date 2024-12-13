import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Candidate } from "@/data/types";

type ResultState = {
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

export function useResultsTable(candidates: Candidate[]) {
  const [results, setResults] = useState<ResultState>(() => {
    const initial: ResultState = {};
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
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadExistingResults();
  }, []);

  const loadExistingResults = async () => {
    try {
      const { data: officialResults, error } = await supabase
        .from('official_results')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (officialResults?.[0]) {
        const newResults: ResultState = {};
        candidates.forEach(candidate => {
          const isInTop15 = officialResults[0].semi_finalists?.includes(candidate.id) || false;
          const isInTop5 = officialResults[0].top_5?.includes(candidate.id) || false;
          const orderedRankingPosition = officialResults[0].ordered_ranking?.indexOf(candidate.id) ?? -1;
          
          newResults[candidate.id] = {
            top15: isInTop15,
            top5: isInTop5,
            fourth: orderedRankingPosition === 4,
            third: orderedRankingPosition === 3,
            second: orderedRankingPosition === 2,
            first: orderedRankingPosition === 1,
            winner: orderedRankingPosition === 0,
          };
        });
        setResults(newResults);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error("Failed to load existing results");
    }
  };

  const handleCheckboxChange = (candidateId: string, field: keyof ResultState[string]) => {
    setResults(prev => {
      const newResults = { ...prev };
      const candidateResults = { ...newResults[candidateId] };

      if (field === 'top15' && !candidateResults.top15) {
        candidateResults.top15 = true;
      } else if (field === 'top15' && candidateResults.top15) {
        candidateResults.top15 = false;
        candidateResults.top5 = false;
        candidateResults.fourth = false;
        candidateResults.third = false;
        candidateResults.second = false;
        candidateResults.first = false;
        candidateResults.winner = false;
      } else if (field === 'top5' && !candidateResults.top5) {
        if (!candidateResults.top15) {
          toast.error("Candidate must be in TOP 15 first");
          return prev;
        }
        candidateResults.top5 = true;
      } else if (field === 'top5' && candidateResults.top5) {
        candidateResults.top5 = false;
        candidateResults.fourth = false;
        candidateResults.third = false;
        candidateResults.second = false;
        candidateResults.first = false;
        candidateResults.winner = false;
      } else {
        if (!candidateResults.top5) {
          toast.error("Candidate must be in TOP 5 first");
          return prev;
        }
        candidateResults[field] = !candidateResults[field];
      }

      newResults[candidateId] = candidateResults;
      return newResults;
    });
  };

  const handleSaveResults = async () => {
    try {
      setIsSaving(true);

      // Convert results to arrays
      const semiFinalists: string[] = [];
      const top5: string[] = [];
      const orderedRanking: string[] = [];

      Object.entries(results).forEach(([candidateId, state]) => {
        if (state.top15) {
          semiFinalists.push(candidateId);
        }
        if (state.top5) {
          top5.push(candidateId);
        }
        if (state.winner) {
          orderedRanking[0] = candidateId;
        } else if (state.first) {
          orderedRanking[1] = candidateId;
        } else if (state.second) {
          orderedRanking[2] = candidateId;
        } else if (state.third) {
          orderedRanking[3] = candidateId;
        } else if (state.fourth) {
          orderedRanking[4] = candidateId;
        }
      });

      // First, check if there's an existing record
      const { data: existingResults } = await supabase
        .from('official_results')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      let upsertData = {
        semi_finalists: semiFinalists,
        final_ranking: orderedRanking.filter(Boolean), // Remove empty slots
        top_5: top5,
        ordered_ranking: orderedRanking,
        submitted_at: new Date().toISOString(),
      };

      // If there's an existing record, include its ID for update
      if (existingResults?.[0]?.id) {
        upsertData = { ...upsertData, id: existingResults[0].id };
      }

      const { error } = await supabase
        .from('official_results')
        .upsert(upsertData);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['officialResults'] });
      toast.success("Official results have been saved!");
    } catch (error: any) {
      console.error('Error saving results:', error);
      toast.error(error.message || "Failed to save official results");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearResults = async () => {
    try {
      setIsClearing(true);
      
      const { error } = await supabase
        .from('official_results')
        .delete()
        .not('id', 'is', null);

      if (error) throw error;

      const clearedResults: ResultState = {};
      candidates.forEach(candidate => {
        clearedResults[candidate.id] = {
          top15: false,
          top5: false,
          fourth: false,
          third: false,
          second: false,
          first: false,
          winner: false,
        };
      });
      setResults(clearedResults);
      
      queryClient.invalidateQueries({ queryKey: ['officialResults'] });
      setIsClearDialogOpen(false);
      toast.success("All results have been cleared");
    } catch (error) {
      console.error('Error clearing results:', error);
      toast.error("Failed to clear results");
    } finally {
      setIsClearing(false);
    }
  };

  return {
    results,
    isSaving,
    isClearing,
    isClearDialogOpen,
    setIsClearDialogOpen,
    handleCheckboxChange,
    handleSaveResults,
    handleClearResults,
  };
}