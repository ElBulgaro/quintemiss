import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function OfficialResults() {
  const queryClient = useQueryClient();
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userPredictions } = useQuery({
    queryKey: ['user-predictions', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log('Fetching user predictions for:', session?.user?.id);
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching predictions:', error);
        throw error;
      }
      console.log('User predictions:', data?.[0]);
      return data?.[0] || null;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the data (formerly cacheTime)
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      console.log('Fetching sheet candidates...');
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('region');
      
      if (error) {
        console.error('Error fetching candidates:', error);
        throw error;
      }

      // Define the ranking order
      const rankOrder = {
        'miss_france': 1,
        '1ere_dauphine': 2,
        '2eme_dauphine': 3,
        '3eme_dauphine': 4,
        '4eme_dauphine': 5,
        'top5': 6,
        'top15': 7,
        'inconnu': 8
      };

      // Sort candidates based on their ranking
      return (data || []).sort((a, b) => {
        // Get the rank order value, defaulting to 8 (inconnu) if not found
        const rankA = rankOrder[a.ranking || 'inconnu'] || 8;
        const rankB = rankOrder[b.ranking || 'inconnu'] || 8;
        
        // Sort by rank order first
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        
        // If ranks are equal, sort by region as a secondary criterion
        return a.region.localeCompare(b.region);
      });
    },
  });

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

  const getRankingDisplay = (ranking: string) => {
    const rankingMap = {
      'miss_france': 'Miss France 2025',
      '1ere_dauphine': '1ère Dauphine',
      '2eme_dauphine': '2ème Dauphine',
      '3eme_dauphine': '3ème Dauphine',
      '4eme_dauphine': '4ème Dauphine',
      'top5': 'Top 5',
      'top15': 'Top 15',
      'inconnu': 'En attente'
    };
    return rankingMap[ranking] || 'En attente';
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Résultats Officiels Miss France 2025
      </h2>

      <div className="space-y-4">
        {candidates?.map((candidate) => {
          const points = getPointsForCandidate(candidate.id, candidate.ranking || 'inconnu');
          const isSelected = userPredictions?.predictions?.includes(candidate.id);
          const ranking = getRankingDisplay(candidate.ranking || 'inconnu');
          
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="text-sm text-muted-foreground">{candidate.region}</p>
                      {candidate.ranking && candidate.ranking !== 'inconnu' && (
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
        })}
      </div>
    </div>
  );
}