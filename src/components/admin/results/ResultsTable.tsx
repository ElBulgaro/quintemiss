import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/types";
import { CandidateRow } from "./CandidateRow";
import { ClearResultsDialog } from "./ClearResultsDialog";
import { useResultsTable } from "./useResultsTable";

interface ResultsTableProps {
  candidates: Candidate[];
}

export function ResultsTable({ candidates }: ResultsTableProps) {
  const {
    results,
    isSaving,
    isClearing,
    isClearDialogOpen,
    setIsClearDialogOpen,
    handleCheckboxChange,
    handleSaveResults,
    handleClearResults,
  } = useResultsTable(candidates);

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
        <Button 
          onClick={handleSaveResults} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Official Results"}
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
                results={results}
                onCheckboxChange={handleCheckboxChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ClearResultsDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        onConfirm={handleClearResults}
        isClearing={isClearing}
      />
    </div>
  );
}