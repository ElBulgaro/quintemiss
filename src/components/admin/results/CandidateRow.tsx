import { Checkbox } from "@/components/ui/checkbox";
import type { Candidate } from "@/data/types";

interface CandidateRowProps {
  candidate: Candidate;
  results: Record<string, {
    top15: boolean;
    top5: boolean;
    fourth: boolean;
    third: boolean;
    second: boolean;
    first: boolean;
    winner: boolean;
  }>;
  onCheckboxChange: (candidateId: string, field: string) => void;
}

export function CandidateRow({ candidate, results, onCheckboxChange }: CandidateRowProps) {
  return (
    <tr key={candidate.id}>
      <td className="font-medium">
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
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.top15}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'top15')}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.top5}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'top5')}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.fourth}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'fourth')}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.third}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'third')}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.second}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'second')}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.first}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'first')}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.winner}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'winner')}
        />
      </td>
    </tr>
  );
}