import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { candidates } from "@/data/candidates";
import { CandidateForm } from "@/components/admin/CandidateForm";
import { CandidateImport } from "@/components/admin/CandidateImport";
import { CandidateList } from "@/components/admin/CandidateList";
import { SemiFinalistSelection } from "@/components/admin/SemiFinalistSelection";
import { FinalRankingSelection } from "@/components/admin/FinalRankingSelection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminCandidates() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [semiFinalists, setSemiFinalists] = useState<string[]>([]);
  const [finalRanking, setFinalRanking] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = (data: any) => {
    console.log("Adding candidate:", data);
    setIsAddDialogOpen(false);
    toast.success("Candidate added successfully!");
  };

  const handleEdit = (data: any) => {
    console.log("Editing candidate:", data);
    setIsEditDialogOpen(false);
    toast.success("Candidate updated successfully!");
  };

  const handleDelete = () => {
    console.log("Deleting candidate:", selectedCandidate);
    setIsDeleteDialogOpen(false);
    toast.success("Candidate deleted successfully!");
  };

  const handleSaveResults = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('official_results')
        .insert({
          semi_finalists: semiFinalists,
          final_ranking: finalRanking,
        });

      if (error) throw error;
      toast.success("Official results saved successfully!");
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error("Failed to save official results");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportConfirm = (importedCandidates: any[]) => {
    console.log("Imported candidates:", importedCandidates);
    toast.success("Candidates imported successfully!");
  };

  return (
    <div className="container mx-auto py-24 px-4">
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="results">Official Results</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-playfair font-bold">Manage Candidates</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </div>

          <CandidateList
            candidates={candidates}
            onEdit={(candidate) => {
              setSelectedCandidate(candidate);
              setIsEditDialogOpen(true);
            }}
            onDelete={(candidate) => {
              setSelectedCandidate(candidate);
              setIsDeleteDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold">Import Candidates</h2>
            <CandidateImport onConfirm={handleImportConfirm} />
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-12">
            <SemiFinalistSelection
              candidates={candidates}
              semiFinalists={semiFinalists}
              onToggleSemiFinalist={(id) => setSemiFinalists(prev => 
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )}
            />

            {semiFinalists.length === 15 && (
              <FinalRankingSelection
                candidates={candidates}
                semiFinalists={semiFinalists}
                finalRanking={finalRanking}
                onUpdateFinalRanking={setFinalRanking}
                onSaveResults={handleSaveResults}
                isSaving={isSaving}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <CandidateForm
            onSubmit={handleAdd}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
          </DialogHeader>
          <CandidateForm
            candidate={selectedCandidate}
            onSubmit={handleEdit}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              candidate from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}