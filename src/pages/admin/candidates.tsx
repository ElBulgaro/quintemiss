import { useState } from "react";
import { CandidatesManagement } from "@/components/admin/CandidatesManagement";
import { CandidateImport } from "@/components/admin/CandidateImport";
import { CandidateForm } from "@/components/admin/CandidateForm";
import { ResultsTable } from "@/components/admin/results/ResultsTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";
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

export default function AdminCandidates() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const { data: candidates, isLoading } = useQuery({
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

  const handleAdd = (data: Partial<Candidate>) => {
    console.log("Adding candidate:", data);
    setIsAddDialogOpen(false);
    toast.success("Candidate added successfully!");
  };

  const handleEdit = (data: Partial<Candidate>) => {
    console.log("Editing candidate:", data);
    setIsEditDialogOpen(false);
    toast.success("Candidate updated successfully!");
  };

  const handleDelete = () => {
    console.log("Deleting candidate:", selectedCandidate);
    setIsDeleteDialogOpen(false);
    toast.success("Candidate deleted successfully!");
  };

  const handleImportConfirm = (importedCandidates: any[]) => {
    console.log("Imported candidates:", importedCandidates);
    toast.success("Candidates imported successfully!");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-24 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-4">
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="results">Official Results</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <CandidatesManagement
            candidates={candidates || []}
            onAdd={() => setIsAddDialogOpen(true)}
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
          <div className="space-y-6">
            <h2 className="text-3xl font-playfair font-bold">Official Results</h2>
            <ResultsTable candidates={candidates || []} />
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