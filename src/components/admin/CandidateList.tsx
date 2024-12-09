import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/data/candidates";

interface CandidateListProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
}

export function CandidateList({ candidates, onEdit, onDelete }: CandidateListProps) {
  return (
    <div className="grid gap-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <img
                src={candidate.image_url}
                alt={candidate.name}
                className="h-16 w-16 object-cover rounded-full"
              />
              <div>
                <h3 className="font-semibold">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {candidate.region} • {candidate.age} ans
                </p>
                {candidate.instagram && (
                  <a 
                    href={`https://instagram.com/${candidate.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {candidate.instagram}
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(candidate)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(candidate)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}