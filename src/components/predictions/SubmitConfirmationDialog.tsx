import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubmitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCandidates: string[];
}

export function SubmitConfirmationDialog({
  open,
  onOpenChange,
  selectedCandidates,
}: SubmitConfirmationDialogProps) {
  const navigate = useNavigate();

  const { data: candidates = [] } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('region');
      
      if (error) throw error;
      return data;
    },
  });

  const getFormattedPredictions = () => {
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

    return positions.join("\n");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prédictions enregistrées avec succès !</DialogTitle>
          <DialogDescription className="space-y-4">
            <p>Votre Top 5 a été enregistré. Vous pouvez maintenant le partager ou voir les résultats.</p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-2">Votre Top 5 pour Miss France 2025 :</p>
              <pre className="whitespace-pre-wrap text-sm">{getFormattedPredictions()}</pre>
            </div>
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
  );
}