import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { candidates } from "@/data/candidates";
import { CandidateForm } from "@/components/admin/CandidateForm";
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

  const toggleSemiFinalist = (candidateId: string) => {
    setSemiFinalists(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const toggleFinalRanking = (candidateId: string) => {
    setFinalRanking(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length < 5) {
        return [...prev, candidateId];
      }
      return prev;
    });
  };

  return (
    <div className="container mx-auto py-24 px-4">
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
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

          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="h-16 w-16 object-cover rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.region} • {candidate.age} ans
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-playfair font-bold mb-4">Semi-Finalists</h2>
              <p className="text-muted-foreground mb-4">Select the semi-finalists by clicking on their cards:</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                  <Card 
                    key={candidate.id}
                    className={`cursor-pointer transition-colors ${
                      semiFinalists.includes(candidate.id) ? 'border-primary' : ''
                    }`}
                    onClick={() => toggleSemiFinalist(candidate.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={candidate.image}
                          alt={candidate.name}
                          className="h-12 w-12 object-cover rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.region}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-playfair font-bold mb-4">Final Ranking (Top 5)</h2>
              <p className="text-muted-foreground mb-4">Select the top 5 candidates in order:</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map((candidate) => (
                  <Card 
                    key={candidate.id}
                    className={`cursor-pointer transition-colors ${
                      finalRanking.includes(candidate.id) 
                        ? 'border-primary' 
                        : ''
                    }`}
                    onClick={() => toggleFinalRanking(candidate.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                          {finalRanking.includes(candidate.id) && (
                            <span className="text-lg font-bold">
                              {finalRanking.indexOf(candidate.id) + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <img
                            src={candidate.image}
                            alt={candidate.name}
                            className="h-12 w-12 object-cover rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground">{candidate.region}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveResults}
                disabled={isSaving || finalRanking.length !== 5}
              >
                {isSaving ? "Saving..." : "Save Official Results"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Candidate Dialog */}
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

      {/* Edit Candidate Dialog */}
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

      {/* Delete Confirmation Dialog */}
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