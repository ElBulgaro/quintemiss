import { Card } from "@/components/ui/card";
import { Trophy, Target, ListOrdered, Crown, Star } from "lucide-react";

export function ScoreExplanation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Target className="h-6 w-6" />
        Système de Points
      </h2>

      <Card className="p-6 space-y-4">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <ListOrdered className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Top 15 (Demi-finalistes)</h3>
              <p className="text-muted-foreground">10 points par candidate correctement prédite dans le top 15</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Trophy className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Top 5</h3>
              <p className="text-muted-foreground">20 points par candidate correctement prédite dans le top 5</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Crown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Position Exacte</h3>
              <p className="text-muted-foreground">50 points par candidate placée à la bonne position dans le top 5</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Star className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Bonus Miss France</h3>
              <p className="text-muted-foreground">50 points bonus pour avoir correctement prédit la gagnante</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Trophy className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Bonus Perfect Match</h3>
              <p className="text-muted-foreground">200 points bonus pour un top 5 parfait dans le bon ordre</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Exemple: Si vous prédisez correctement la gagnante, vous obtenez 130 points:
            10 (top 15) + 20 (top 5) + 50 (position exacte) + 50 (bonus gagnante)
          </p>
        </div>
      </Card>
    </div>
  );
}