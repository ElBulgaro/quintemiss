import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePredictions } from "@/hooks/use-predictions";
import { SelectedCandidates } from "@/components/predictions/SelectedCandidates";
import { CandidatesList } from "@/components/predictions/CandidatesList";
import { PredictionsHeader } from "@/components/predictions/PredictionsHeader";
import { HelpSection } from "@/components/predictions/HelpSection";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/types";

export default function Predictions() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [singleColumn, setSingleColumn] = useState(false);
  
  const { 
    selectedCandidates, 
    isSubmitting, 
    updatePredictions, 
    clearPredictions, 
    savePredictions 
  } = usePredictions();
  
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Candidate[];
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const items = [...selectedCandidates];
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      updatePredictions(newOrder);
    }
  };

  const handleCandidateSelect = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      updatePredictions(selectedCandidates.filter((id) => id !== candidateId));
    } else {
      updatePredictions([...selectedCandidates, candidateId]);
    }
  };

  const handleSubmit = async () => {
    const success = await savePredictions();
    if (success) {
      setTimeout(() => navigate("/leaderboard"), 2000);
    }
  };

  const getSelectionMessage = () => {
    if (selectedCandidates.length < 5) {
      return "Complétez votre Top 5 pour valider vos prédictions";
    }
    if (selectedCandidates.length > 5) {
      return "Réduisez votre sélection à 5 candidates pour valider vos prédictions";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PredictionsHeader selectedCount={selectedCandidates.length} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content - Selected candidates */}
          <div className="lg:col-span-8">
            <div className="glass-card p-6 rounded-lg mb-8">
              <SelectedCandidates
                selectedCandidates={selectedCandidates}
                onDragEnd={handleDragEnd}
                onCandidateSelect={handleCandidateSelect}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onClearData={clearPredictions}
                candidates={candidates}
              />
            </div>

            {/* Selection message */}
            {getSelectionMessage() && (
              <p className="text-center text-rich-black/60 mb-4">
                {getSelectionMessage()}
              </p>
            )}

            {/* Candidate selection button/drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full mb-4"
                  disabled={selectedCandidates.length === 5}
                >
                  Sélectionner des candidates ({selectedCandidates.length}/5)
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh] p-0">
                <CandidatesList
                  selectedCandidates={selectedCandidates}
                  onCandidateSelect={handleCandidateSelect}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick help section */}
          <div className="lg:col-span-4">
            <HelpSection />
          </div>
        </div>
      </div>
    </div>
  );
}