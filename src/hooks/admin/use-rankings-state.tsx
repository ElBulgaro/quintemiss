import { useState } from "react";
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

export function useRankingsState(candidates: Candidate[]) {
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

  return {
    rankings,
    setRankings,
  };
}