import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminRankings } from "@/hooks/admin/use-admin-rankings";
import type { Candidate } from "@/data/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CandidateRow } from "./CandidateRow";
import { ClearResultsDialog } from "./ClearResultsDialog";

interface ResultsTableProps {
  candidates: Candidate[];
}

export function ResultsTable({ candidates }: ResultsTableProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const {
    rankings,
    isClearing,
    handleRankingChange,
    clearAllRankings,
  } = useAdminRankings(candidates);

  const sortedCandidates = [...candidates].sort((a, b) => 
    a.region.localeCompare(b.region)
  );

  const handleSaveResults = async () => {
    try {
      setIsSaving(true);
      
      // Create a new official result if none exists
      const { data: newEvent, error: eventError } = await supabase
        .from('official_results')
        .insert({
          semi_finalists: [],
          final_ranking: [],
          top_5: [],
          ordered_ranking: [],
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Convert results to arrays
      const semiFinalists: string[] = [];
      const top5: string[] = [];
      const orderedRanking: string[] = [];

      Object.entries(rankings).forEach(([candidateId, state]) => {
        if (state.top15) {
          semiFinalists.push(candidateId);
        }
        if (state.top5) {
          top5.push(candidateId);
        }
        if (state.winner) {
          orderedRanking[0] = candidateId;
        } else if (state.first) {
          orderedRanking[1] = candidateId;
        } else if (state.second) {
          orderedRanking[2] = candidateId;
        } else if (state.third) {
          orderedRanking[3] = candidateId;
        } else if (state.fourth) {
          orderedRanking[4] = candidateId;
        }
      });

      const { error } = await supabase
        .from('official_results')
        .upsert({
          id: newEvent.id,
          semi_finalists: semiFinalists,
          final_ranking: orderedRanking.filter(Boolean),
          top_5: top5,
          ordered_ranking: orderedRanking,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Official results have been saved!");
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error("Failed to save official results");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          variant="destructive"
          onClick={() => setIsClearDialogOpen(true)}
          disabled={isClearing}
        >
          {isClearing ? "Clearing..." : "Clear Results"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Candidate</TableHead>
              <TableHead>TOP 15</TableHead>
              <TableHead>TOP 5</TableHead>
              <TableHead>4EME D</TableHead>
              <TableHead>3EME D</TableHead>
              <TableHead>2EME D</TableHead>
              <TableHead>1ERE D</TableHead>
              <TableHead>MISS FRANCE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                results={rankings}
                onCheckboxChange={handleRankingChange}
                disabled={isSaving}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ClearResultsDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        onConfirm={clearAllRankings}
        isClearing={isClearing}
      />
    </div>
  );
}