import { Checkbox } from "@/components/ui/checkbox";
import type { Candidate } from "@/data/types";
import type { RankingState } from "@/hooks/use-admin-rankings";

interface CandidateRowProps {
  candidate: Candidate;
  results: RankingState;
  onCheckboxChange: (candidateId: string, field: string) => void;
  disabled?: boolean;
}

export function CandidateRow({ 
  candidate, 
  results, 
  onCheckboxChange,
  disabled 
}: CandidateRowProps) {
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
          disabled={disabled}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.top5}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'top5')}
          disabled={disabled}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.fourth}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'fourth')}
          disabled={disabled}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.third}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'third')}
          disabled={disabled}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.second}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'second')}
          disabled={disabled}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.first}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'first')}
          disabled={disabled}
        />
      </td>
      <td>
        <Checkbox
          checked={results[candidate.id]?.winner}
          onCheckedChange={() => onCheckboxChange(candidate.id, 'winner')}
          disabled={disabled}
        />
      </td>
    </tr>
  );
}