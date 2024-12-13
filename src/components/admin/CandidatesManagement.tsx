import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { CandidateList } from "./CandidateList";
import { SheetCandidatesList } from "./SheetCandidatesList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CandidatesManagementProps {
  candidates: Candidate[];
  onAdd: () => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
}

export function CandidatesManagement({
  candidates,
  onAdd,
  onEdit,
  onDelete,
}: CandidatesManagementProps) {
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('candidates')
        .delete()
        .gt('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      
      toast.success("All candidates have been deleted");
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Error deleting candidates:', error);
      toast.error("Failed to delete candidates");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="sheet">Sheet Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-playfair font-bold">Manage Candidates</h2>
              <div className="flex gap-2">
                <Button onClick={onAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All
                </Button>
              </div>
            </div>

            <CandidateList
              candidates={candidates}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </TabsContent>

        <TabsContent value="sheet">
          <SheetCandidatesList />
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all candidates
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}