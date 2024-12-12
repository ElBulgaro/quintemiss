import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePredictionsStorage } from "@/hooks/use-predictions-storage";
import { SelectedCandidates } from "@/components/predictions/SelectedCandidates";
import { CandidatesList } from "@/components/predictions/CandidatesList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus, Trophy, Info } from "lucide-react";
import type { Candidate } from "@/data/types";

export default function Predictions() {
  const navigate = useNavigate();
  const { selectedCandidates, updatePredictions, clearPredictions } = usePredictionsStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid-2' | 'grid-3' | 'list'>('grid-2');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  
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
    // Show welcome message for new users
    if (showTutorial) {
      toast("Bienvenue sur Quinté Miss! 🎉", {
        description: "Sélectionnez vos 5 candidates favorites et classez-les!",
        action: {
          label: "Compris!",
          onClick: () => setShowTutorial(false)
        }
      });
    }
  }, [showTutorial]);

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
      
      // Show success animation and message
      toast.success("🎉 Prédictions enregistrées!", {
        description: "Rendez-vous sur le leaderboard pour voir votre classement!"
      });
      
      // Navigate to leaderboard after short delay
      setTimeout(() => navigate("/leaderboard"), 2000);
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
          <p className="text-lg md:text-xl text-rich-black/60 max-w-2xl mx-auto mb-8">
            Sélectionnez et classez vos 5 candidates favorites pour le titre de Miss France 2024
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gold" />
              <span className="text-lg font-medium">
                {selectedCandidates.length}/5 sélectionnées
              </span>
            </div>
          </div>
        </div>

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
                onClearData={handleClearData}
                candidates={candidates}
              />
            </div>

            {/* Candidate selection button/drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full mb-4"
                  disabled={selectedCandidates.length >= 5}
                >
                  {selectedCandidates.length >= 5 
                    ? "5 candidates sélectionnées ✨" 
                    : "Sélectionner des candidates"}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh]">
                <CandidatesList
                  viewMode={viewMode}
                  selectedCandidates={selectedCandidates}
                  onViewChange={setViewMode}
                  onCandidateSelect={handleCandidateSelect}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick help section */}
          <div className="lg:col-span-4">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-gold" />
                <h3 className="text-lg font-medium">Comment ça marche ?</h3>
              </div>
              <ol className="space-y-4 text-rich-black/80">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  Sélectionnez 5 candidates parmi toutes les Miss
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  Classez-les par glisser-déposer selon vos prédictions
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  Validez vos choix et comparez avec les autres joueurs!
                </li>
              </ol>
              <Button 
                variant="outline" 
                className="w-full mt-6"
                onClick={() => navigate("/leaderboard")}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Voir le classement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}