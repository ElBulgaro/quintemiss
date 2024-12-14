import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";
import { useNavigate } from "react-router-dom";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prédictions enregistrées avec succès !</DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">
            Votre Top 5 a été enregistré. Vous pouvez maintenant le partager ou voir les résultats.
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