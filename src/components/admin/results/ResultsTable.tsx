import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/types";
import { CandidateRow } from "./CandidateRow";
import { ClearResultsDialog } from "./ClearResultsDialog";
import { useState } from "react";
import { useAdminRankings } from "@/hooks/admin/use-admin-rankings";

interface ResultsTableProps {
  candidates: Candidate[];
}

export function ResultsTable({ candidates }: ResultsTableProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const {
    rankings,
    isSaving,
    isClearing,
    handleRankingChange,
    clearAllRankings,
  } = useAdminRankings(candidates);

  const sortedCandidates = [...candidates].sort((a, b) => 
    a.region.localeCompare(b.region)
  );

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