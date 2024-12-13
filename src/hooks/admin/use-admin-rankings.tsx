import { useRankingsState } from "@/hooks/admin/use-rankings-state";
import { useRankingsRealtime } from "@/hooks/admin/use-rankings-realtime";
import { useRankingsOperations } from "@/hooks/admin/use-rankings-operations";
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