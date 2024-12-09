import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { SortableCandidate } from "@/components/SortableCandidate";
import { candidates } from "@/data/candidates";
import { CountdownTimer } from "@/components/CountdownTimer";

interface SelectedCandidatesProps {
  selectedCandidates: string[];
  onDragEnd: (event: any) => void;
  onCandidateSelect: (id: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const SelectedCandidates = ({
  selectedCandidates,
  onDragEnd,
  onCandidateSelect,
  onSubmit,
  isSubmitting,
}: SelectedCandidatesProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-rich-black mb-4">Votre Top 5</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={selectedCandidates}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {selectedCandidates.map((id, index) => {
              const candidate = candidates.find((c) => c.id === id);
              if (!candidate) return null;
              return (
                <SortableCandidate
                  key={id}
                  candidate={candidate}
                  index={index}
                  onRemove={() => onCandidateSelect(id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      {selectedCandidates.length === 0 && (
        <p className="text-center text-rich-black/60 py-8">
          Sélectionnez des candidates dans la liste ci-contre
        </p>
      )}
      <Button
        onClick={onSubmit}
        className="w-full mt-6"
        disabled={selectedCandidates.length !== 5 || isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : "Valider mes prédictions"}
      </Button>
      <CountdownTimer />
    </div>
  );
};