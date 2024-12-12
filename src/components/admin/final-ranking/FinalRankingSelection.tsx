import { Button } from "@/components/ui/button";
import { FinalRankingCard } from "./FinalRankingCard";
import { useFinalRanking } from "./useFinalRanking";
import type { Candidate } from "@/data/types";

interface FinalRankingSelectionProps {
  candidates: Candidate[];
  semiFinalists: string[];
  finalRanking: string[];
  onUpdateFinalRanking: (ranking: string[]) => void;
  onSaveResults: () => void;
}

export function FinalRankingSelection({
  candidates,
  semiFinalists,
  finalRanking,
  onUpdateFinalRanking,
  onSaveResults,
}: FinalRankingSelectionProps) {
  const { isSaving, saveFinalRanking } = useFinalRanking();

  const handleCandidateSelect = (candidateId: string) => {
    if (!semiFinalists.includes(candidateId)) {
      toast.error("Can only select from semi-finalists");
      return;
    }

    let newRanking: string[];
    if (finalRanking.includes(candidateId)) {
      newRanking = finalRanking.filter(id => id !== candidateId);
    } else if (finalRanking.length < 5) {
      newRanking = [...finalRanking, candidateId];
    } else {
      toast.error("Maximum 5 candidates in final ranking");
      return;
    }

    onUpdateFinalRanking(newRanking);
  };

  const handleSaveResults = async () => {
    const success = await saveFinalRanking(finalRanking);
    if (success) {
      onSaveResults();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-playfair font-bold mb-4">Final Ranking Selection (Top 5)</h2>
        <p className="text-muted-foreground mb-4">
          Select up to 5 candidates from semi-finalists and drag to reorder ({finalRanking.length}/5 selected)
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {candidates
            .filter(candidate => semiFinalists.includes(candidate.id))
            .map((candidate) => (
              <FinalRankingCard
                key={candidate.id}
                candidate={candidate}
                isSelected={finalRanking.includes(candidate.id)}
                rank={finalRanking.indexOf(candidate.id)}
                onClick={() => handleCandidateSelect(candidate.id)}
              />
            ))}
        </div>

        <Button 
          onClick={handleSaveResults}
          disabled={isSaving || finalRanking.length !== 5}
          className="mt-6"
        >
          {isSaving ? "Saving..." : "Save Official Results"}
        </Button>
      </div>
    </div>
  );
}