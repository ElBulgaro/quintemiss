import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCandidate } from "@/components/SortableCandidate";
import { CandidateCard } from "@/components/CandidateCard";
import { candidates } from "@/data/candidates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Helper function to get or create visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
};

export default function Predictions() {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved predictions from localStorage on component mount
  useEffect(() => {
    const savedPredictions = localStorage.getItem('predictions');
    if (savedPredictions) {
      setSelectedCandidates(JSON.parse(savedPredictions));
    }
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedCandidates((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCandidateSelect = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId));
    } else if (selectedCandidates.length < 5) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      toast.error("Vous ne pouvez sélectionner que 5 candidates");
    }
  };

  const handleSubmit = async () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner exactement 5 candidates");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to localStorage
      localStorage.setItem('predictions', JSON.stringify(selectedCandidates));

      // Prepare prediction data
      const predictionData = {
        visitorId: getVisitorId(),
        predictions: selectedCandidates,
        submittedAt: new Date().toISOString(),
      };

      // Log the prediction data (for now)
      console.log('Saving prediction:', predictionData);

      toast.success("Vos prédictions ont été enregistrées");
    } catch (error) {
      console.error('Error saving predictions:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-rich-black mb-6">
            Vos Prédictions
            <br />
            <span className="text-gold">Top 5</span>
          </h1>
          <p className="text-lg md:text-xl text-rich-black/60 max-w-2xl mx-auto">
            Sélectionnez et classez vos 5 candidates favorites pour le titre de Miss France 2024
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selected Candidates */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-rich-black mb-4">Votre Top 5</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
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
                        onRemove={() => handleCandidateSelect(id)}
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
              onClick={handleSubmit}
              className="w-full mt-6"
              disabled={selectedCandidates.length !== 5 || isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Valider mes prédictions"}
            </Button>
          </div>

          {/* Available Candidates */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-rich-black mb-4">Candidates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="cursor-pointer"
                  onClick={() => handleCandidateSelect(candidate.id)}
                >
                  <CandidateCard
                    {...candidate}
                    selected={selectedCandidates.includes(candidate.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
