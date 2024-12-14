import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface ClearConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
}

export function ClearConfirmationDialog({
  open,
  onOpenChange,
  onClear,
}: ClearConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
          >
            Effacer
          </Button>
        </DialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}