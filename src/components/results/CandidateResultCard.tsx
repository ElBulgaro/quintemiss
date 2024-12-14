import { Card } from "@/components/ui/card";
import type { Candidate } from "@/data/types";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const getPointsBreakdown = (ranking: string, points: number) => {
    const breakdown = [];
    
    // Top 15 points
    if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5', 'top15'].includes(ranking)) {
      breakdown.push('+10');
    }
    
    // Top 5 points
    if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5'].includes(ranking)) {
      breakdown.push('+20');
    }
    
    // Position points (50)
    if (points >= 50) {
      breakdown.push('+50');
    }
    
    // Winner bonus (additional 50)
    if (ranking === 'miss_france' && points >= 130) {
      breakdown.push('+50');
    }
    
    return breakdown.join(' ');
  };

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-lg font-bold text-gold">
                    {getPointsBreakdown(candidate.ranking || 'inconnu', points)} → +{points}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    Top 15: +10 pts<br />
                    Top 5: +20 pts<br />
                    Position exacte: +50 pts<br />
                    {candidate.ranking === 'miss_france' && 'Bonus gagnante: +50 pts'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        )}
      </div>
    </Card>
  );
}