import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Candidate } from "@/data/candidates";

interface SemiFinalistSelectionProps {
  candidates: Candidate[];
  semiFinalists: string[];
  onToggleSemiFinalist: (candidateId: string) => void;
}

export function SemiFinalistSelection({
  candidates,
  semiFinalists,
  onToggleSemiFinalist,
}: SemiFinalistSelectionProps) {
  const handleToggle = (candidateId: string) => {
    if (semiFinalists.includes(candidateId)) {
      onToggleSemiFinalist(candidateId);
    } else if (semiFinalists.length < 15) {
      onToggleSemiFinalist(candidateId);
    } else {
      toast.error("Maximum 15 semi-finalists allowed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-bold mb-4">Semi-Finalists Selection (Top 15)</h2>
      <p className="text-muted-foreground mb-4">
        Select up to 15 semi-finalists ({semiFinalists.length}/15 selected)
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id}
            className={`cursor-pointer transition-colors ${
              semiFinalists.includes(candidate.id) ? 'border-primary' : ''
            }`}
            onClick={() => handleToggle(candidate.id)}
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
  );
}