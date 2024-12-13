import { useRankingsState } from "./use-rankings-state";
import { useRankingsRealtime } from "./use-rankings-realtime";
import { useRankingsOperations } from "./use-rankings-operations";
import type { Candidate } from "@/data/types";

export function useAdminRankings(candidates: Candidate[]) {
  const { rankings, setRankings } = useRankingsState(candidates);
  
  const {
    isSaving,
    isClearing,
    loadExistingRankings,
    handleRankingChange,
    clearAllRankings,
  } = useRankingsOperations(candidates, rankings, setRankings);

  useRankingsRealtime(loadExistingRankings);

  return {
    rankings,
    isSaving,
    isClearing,
    handleRankingChange,
    clearAllRankings,
  };
}
