import { Card, CardContent } from "@/components/ui/card";
import type { Candidate } from "@/data/types";

interface FinalRankingCardProps {
  candidate: Candidate;
  isSelected: boolean;
  rank?: number;
  onClick: () => void;
}

export function FinalRankingCard({
  candidate,
  isSelected,
  rank,
  onClick,
}: FinalRankingCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-gold/5 border-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]'
          : 'hover:bg-white/80'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
            {rank !== undefined && (
              <span className="text-lg font-bold text-gold">
                {rank + 1}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <img
              src={candidate.image_url}
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
  );
}