import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { SortableCandidate } from "@/components/SortableCandidate";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShareButton } from "./ShareButton";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
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

  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) {
      setShowSubmitDialog(true);
    }
  };

  const generatePredictionText = () => {
    if (selectedCandidates.length !== 5) return "";

    const positions = selectedCandidates.map((id, index) => {
      const candidate = candidates.find(c => c.id === id);
      if (!candidate) return "";
      
      const position = index === 0 
        ? "👑 Miss France 2025"
        : index === 1 
          ? "2️⃣ 1ere Dauphine"
          : index === 2 
            ? "3️⃣ 2eme Dauphine"
            : index === 3 
              ? "4️⃣ 3eme Dauphine"
              : "5️⃣ 4eme Dauphine";
      
      return `${position} - ${candidate.region}`;
    });

    return `Votre Top 5 pour Miss France 2025 :\n\n${positions.join("\n")}`;
  };

  return (
    <div className="rounded-lg">
      <div className="space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
        <h2 className="text-xl md:text-2xl font-bold text-rich-black">Votre Top 5</h2>
        <div className="flex items-center gap-2">
          <ShareButton selectedCandidates={selectedCandidates} />
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-sm hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tout effacer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <DialogHeader>
                <DialogTitle>Effacer la sélection ?</DialogTitle>
                <DialogDescription>
                  Cette action effacera votre Top 5 actuel. Cette action ne peut pas être annulée.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onClearData();
                    setShowClearDialog(false);
                  }}
                >
                  Effacer
                </Button>
              </DialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          <div className="space-y-4 mt-6">
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
        onClick={handleSubmit}
        className="w-full mt-2"
        disabled={selectedCandidates.length !== 5 || isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : "Valider mes prédictions"}
      </Button>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prédictions enregistrées avec succès !</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">
              {generatePredictionText()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <ShareButton selectedCandidates={selectedCandidates} />
            <Button onClick={() => navigate("/results")}>
              Voir les résultats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CountdownTimer />
    </div>
  );
};