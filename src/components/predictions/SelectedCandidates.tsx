import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { SortableCandidate } from "@/components/SortableCandidate";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShareButton } from "./ShareButton";

interface SelectedCandidatesProps {
  selectedCandidates: string[];
  onDragEnd: (event: any) => void;
  onCandidateSelect: (id: string) => void;
  onSubmit: () => void;
  onClearData: () => void;
  isSubmitting: boolean;
}

export const SelectedCandidates = ({
  selectedCandidates,
  onDragEnd,
  onCandidateSelect,
  onSubmit,
  onClearData,
  isSubmitting,
}: SelectedCandidatesProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch candidates from sheet_candidates table
  const { data: candidates = [] } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('region');
      
      if (error) {
        console.error('Error fetching sheet candidates:', error);
        throw error;
      }
      
      return data;
    },
  });

  const getValidationMessage = () => {
    if (selectedCandidates.length < 5) {
      return "Complétez votre Top 5 pour valider vos prédictions";
    }
    if (selectedCandidates.length > 5) {
      return "Réduisez votre sélection à 5 candidates pour valider vos prédictions";
    }
    return null;
  };

  return (
    <div className="rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-rich-black">Votre Top 5</h2>
        <div className="flex items-center gap-2">
          <ShareButton selectedCandidates={selectedCandidates} />
          <Button
            onClick={onClearData}
            variant="outline"
            className="text-sm"
          >
            Tout effacer
          </Button>
        </div>
      </div>
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
      {getValidationMessage() && (
        <p className="text-center text-rich-black/40 text-sm mt-6 mb-2">
          {getValidationMessage()}
        </p>
      )}
      <Button
        onClick={onSubmit}
        className="w-full mt-2"
        disabled={selectedCandidates.length !== 5 || isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : "Valider mes prédictions"}
      </Button>
      <CountdownTimer />
    </div>
  );
};