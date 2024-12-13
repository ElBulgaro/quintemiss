import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function OfficialResults() {
  const { data: userPredictions } = useQuery({
    queryKey: ['user-predictions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    },
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('region');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
          <Trophy className="h-6 w-6 text-gold" />
          Résultats Officiels Miss France 2025
        </h2>
        <Card className="p-6">
          <p className="text-center text-rich-black/60">
            Chargement des résultats...
          </p>
        </Card>
      </div>
    );
  }

  const getPointsForCandidate = (candidateId: string, ranking: string) => {
    if (!userPredictions?.predictions) return 0;
    const position = userPredictions.predictions.indexOf(candidateId);
    if (position === -1) return 0;

    let points = 0;
    
    // Points for being in top 15
    if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5', 'top15'].includes(ranking)) {
      points += 10;
    }

    // Points for being in top 5
    if (['miss_france', '1ere_dauphine', '2eme_dauphine', '3eme_dauphine', '4eme_dauphine', 'top5'].includes(ranking)) {
      points += 20;
    }

    // Points for correct position
    if (
      (ranking === 'miss_france' && position === 0) ||
      (ranking === '1ere_dauphine' && position === 1) ||
      (ranking === '2eme_dauphine' && position === 2) ||
      (ranking === '3eme_dauphine' && position === 3) ||
      (ranking === '4eme_dauphine' && position === 4)
    ) {
      points += 50;
    }

    // Winner bonus
    if (ranking === 'miss_france' && position === 0) {
      points += 50;
    }

    return points;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Résultats Officiels Miss France 2025
      </h2>

      <div className="space-y-4">
        {candidates.map((candidate) => {
          const points = getPointsForCandidate(candidate.id, candidate.ranking || 'inconnu');
          const isSelected = userPredictions?.predictions?.includes(candidate.id);
          
          return (
            <Card 
              key={candidate.id} 
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
                    <p className="text-sm text-muted-foreground">{candidate.region}</p>
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
        })}
      </div>
    </div>
  );
}