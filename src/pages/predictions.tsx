import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePredictionsStorage } from "@/hooks/use-predictions-storage";
import { SelectedCandidates } from "@/components/predictions/SelectedCandidates";
import { CandidatesList } from "@/components/predictions/CandidatesList";

export default function Predictions() {
  const navigate = useNavigate();
  const { selectedCandidates, updatePredictions, clearPredictions } = usePredictionsStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid-2' | 'grid-3' | 'list'>('grid-2');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
    } else if (selectedCandidates.length < 5) {
      updatePredictions([...selectedCandidates, candidateId]);
    } else {
      toast.error("Vous ne pouvez sélectionner que 5 candidates");
    }
  };

  const handleClearData = () => {
    clearPredictions();
    toast.success("Toutes les données ont été effacées");
  };

  const handleSubmit = async () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner exactement 5 candidates");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour sauvegarder vos prédictions", {
        action: {
          label: "Se connecter",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Une erreur est survenue, veuillez vous reconnecter");
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from('predictions')
        .upsert({
          user_id: user.id,
          predictions: selectedCandidates,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;
      
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
          <SelectedCandidates
            selectedCandidates={selectedCandidates}
            onDragEnd={handleDragEnd}
            onCandidateSelect={handleCandidateSelect}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onClearData={handleClearData}
          />
          <CandidatesList
            viewMode={viewMode}
            selectedCandidates={selectedCandidates}
            onViewChange={setViewMode}
            onCandidateSelect={handleCandidateSelect}
          />
        </div>
      </div>
    </div>
  );
}