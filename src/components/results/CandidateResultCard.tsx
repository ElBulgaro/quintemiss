import { Card } from "@/components/ui/card";
import type { Candidate } from "@/data/types";

interface CandidateResultCardProps {
  candidate: Candidate;
  isSelected: boolean;
  points: number;
  ranking: string;
}

export function CandidateResultCard({ 
  candidate, 
  isSelected, 
  points, 
  ranking 
}: CandidateResultCardProps) {
  return (
    <Card 
      className={`p-4 transition-all ${
        isSelected ? 'bg-gold/5 border-gold' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={candidate.official_photo_url || candidate.image_url}
              alt={candidate.name}
              className="absolute w-[400%] h-[400%] object-cover object-top left-1/2 -translate-x-1/2"
            />
          </div>
          <div>
            <h3 className="font-semibold">{candidate.name}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <p className="text-sm text-muted-foreground">{candidate.region}</p>
              {ranking && ranking !== 'inconnu' && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <p className="text-sm font-medium text-gold">{ranking}</p>
                </>
              )}
            </div>
          </div>
        </div>
        {isSelected && points > 0 && (
          <div className="text-right">
            <p className="text-lg font-bold text-gold">+{points}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        )}
      </div>
    </Card>
  );
}