import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

interface ResultsTableProps {
  candidates: Candidate[];
}

type ResultState = {
  [key: string]: {
    top15: boolean;
    top5: boolean;
    fourth: boolean;
    third: boolean;
    second: boolean;
    first: boolean;
    winner: boolean;
  };
};

export function ResultsTable({ candidates }: ResultsTableProps) {
  const [results, setResults] = useState<ResultState>(() => {
    const initial: ResultState = {};
    candidates.forEach(candidate => {
      initial[candidate.id] = {
        top15: false,
        top5: false,
        fourth: false,
        third: false,
        second: false,
        first: false,
        winner: false,
      };
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleCheckboxChange = (candidateId: string, field: keyof ResultState[string]) => {
    setResults(prev => {
      const newResults = { ...prev };
      const candidateResults = { ...newResults[candidateId] };

      // Handle dependencies and restrictions
      if (field === 'top15' && !candidateResults.top15) {
        // If enabling top15, no changes needed
        candidateResults.top15 = true;
      } else if (field === 'top15' && candidateResults.top15) {
        // If disabling top15, disable all dependent fields
        candidateResults.top15 = false;
        candidateResults.top5 = false;
        candidateResults.fourth = false;
        candidateResults.third = false;
        candidateResults.second = false;
        candidateResults.first = false;
        candidateResults.winner = false;
      } else if (field === 'top5' && !candidateResults.top5) {
        // Can only enable top5 if top15 is selected
        if (!candidateResults.top15) {
          toast.error("Candidate must be in TOP 15 first");
          return prev;
        }
        candidateResults.top5 = true;
      } else if (field === 'top5' && candidateResults.top5) {
        // If disabling top5, disable all dependent fields
        candidateResults.top5 = false;
        candidateResults.fourth = false;
        candidateResults.third = false;
        candidateResults.second = false;
        candidateResults.first = false;
        candidateResults.winner = false;
      } else {
        // For final ranking positions (fourth through winner)
        if (!candidateResults.top5) {
          toast.error("Candidate must be in TOP 5 first");
          return prev;
        }
        candidateResults[field] = !candidateResults[field];
      }

      newResults[candidateId] = candidateResults;
      return newResults;
    });
  };

  const handleSaveResults = async () => {
    try {
      setIsSaving(true);

      // Convert results to final_ranking and semi_finalists arrays
      const semiFinalists: string[] = [];
      const finalRanking: string[] = new Array(5);

      Object.entries(results).forEach(([candidateId, state]) => {
        if (state.top15) {
          semiFinalists.push(candidateId);
        }
        if (state.winner) {
          finalRanking[0] = candidateId;
        } else if (state.first) {
          finalRanking[1] = candidateId;
        } else if (state.second) {
          finalRanking[2] = candidateId;
        } else if (state.third) {
          finalRanking[3] = candidateId;
        } else if (state.fourth) {
          finalRanking[4] = candidateId;
        }
      });

      // Save to database
      const { error } = await supabase
        .from('official_results')
        .insert({
          semi_finalists: semiFinalists,
          final_ranking: finalRanking.filter(Boolean), // Remove any undefined values
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

  const sortedCandidates = [...candidates].sort((a, b) => 
    a.region.localeCompare(b.region)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
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
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={candidate.image_url}
                      alt={candidate.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <div>{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.region}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.top15}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'top15')}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.top5}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'top5')}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.fourth}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'fourth')}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.third}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'third')}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.second}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'second')}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.first}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'first')}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={results[candidate.id]?.winner}
                    onCheckedChange={() => handleCheckboxChange(candidate.id, 'winner')}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}