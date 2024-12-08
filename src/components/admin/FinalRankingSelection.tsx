import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SortableCandidate } from "@/components/SortableCandidate";
import type { Candidate } from "@/data/candidates";
import { toast } from "sonner";

interface FinalRankingSelectionProps {
  candidates: Candidate[];
  semiFinalists: string[];
  finalRanking: string[];
  onUpdateFinalRanking: (ranking: string[]) => void;
  onSaveResults: () => void;
  isSaving: boolean;
}

export function FinalRankingSelection({
  candidates,
  semiFinalists,
  finalRanking,
  onUpdateFinalRanking,
  onSaveResults,
  isSaving,
}: FinalRankingSelectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = finalRanking.indexOf(active.id);
    const newIndex = finalRanking.indexOf(over.id);

    const newRanking = [...finalRanking];
    newRanking.splice(oldIndex, 1);
    newRanking.splice(newIndex, 0, active.id);
    onUpdateFinalRanking(newRanking);
  };

  const handleCandidateSelect = (candidateId: string) => {
    if (!semiFinalists.includes(candidateId)) {
      toast.error("Can only select from semi-finalists");
      return;
    }

    if (finalRanking.includes(candidateId)) {
      onUpdateFinalRanking(finalRanking.filter(id => id !== candidateId));
    } else if (finalRanking.length < 5) {
      onUpdateFinalRanking([...finalRanking, candidateId]);
    } else {
      toast.error("Maximum 5 candidates in final ranking");
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
              <Card 
                key={candidate.id}
                className={`cursor-pointer transition-colors ${
                  finalRanking.includes(candidate.id) ? 'border-primary' : ''
                }`}
                onClick={() => handleCandidateSelect(candidate.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {finalRanking.includes(candidate.id) && (
                        <span className="text-lg font-bold">
                          {finalRanking.indexOf(candidate.id) + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="h-12 w-12 object-cover rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.region}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {finalRanking.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Current Ranking</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={finalRanking}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {finalRanking.map((id, index) => {
                    const candidate = candidates.find(c => c.id === id);
                    if (!candidate) return null;
                    return (
                      <SortableCandidate
                        key={id}
                        candidate={candidate}
                        index={index}
                        onRemove={() => handleCandidateSelect(id)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        <Button 
          onClick={onSaveResults}
          disabled={isSaving || finalRanking.length !== 5}
          className="mt-6"
        >
          {isSaving ? "Saving..." : "Save Official Results"}
        </Button>
      </div>
    </div>
  );
}