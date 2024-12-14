import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ResultsHeader } from "./ResultsHeader";
import { CandidateResultCard } from "./CandidateResultCard";
import { getRankingOrder } from "@/utils/rankingOrder";

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

export function OfficialResults() {
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
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      console.log('Fetching sheet candidates...');
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*');
      
      if (error) {
        console.error('Error fetching candidates:', error);
        throw error;
      }

      // Sort candidates based on their ranking
      return (data || []).sort((a, b) => {
        const rankA = getRankingOrder(a.ranking);
        const rankB = getRankingOrder(b.ranking);
        
        // Sort by rank order first
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        
        // If ranks are equal, sort by region as a secondary sort
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ResultsHeader />
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
      <ResultsHeader />
      <div className="space-y-4">
        {candidates?.map((candidate) => {
          const isSelected = userPredictions?.predictions?.includes(candidate.id);
          const points = getPointsForCandidate(candidate.id, candidate.ranking || 'inconnu');
          const ranking = getRankingDisplay(candidate.ranking || 'inconnu');
          
          return (
            <CandidateResultCard
              key={candidate.id}
              candidate={candidate}
              isSelected={isSelected}
              points={points}
              ranking={ranking}
            />
          );
        })}
      </div>
    </div>
  );
}