import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Leaderboard() {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      console.log('Current user:', session.user);
      return session.user;
    },
  });

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      console.log('Fetching leaderboard data...');
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('user_id, score, perfect_match, scored_at')
        .order('score', { ascending: false })
        .limit(10);

      if (scoresError) {
        console.error('Error fetching scores:', scoresError);
        throw scoresError;
      }

      console.log('Fetched scores:', scores);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', scores.map(score => score.user_id));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles);

      const combinedData = scores.map(score => {
        const profile = profiles.find(p => p.id === score.user_id);
        return {
          ...score,
          username: profile?.username || 'Anonymous User'
        };
      });

      console.log('Combined leaderboard data:', combinedData);
      return combinedData;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: userScore } = useQuery({
    queryKey: ['user-score'],
    enabled: !!currentUser,
    queryFn: async () => {
      console.log('Fetching user score for:', currentUser?.id);
      const { data, error } = await supabase
        .from('scores')
        .select('score, perfect_match, scored_at')
        .eq('user_id', currentUser?.id)
        .limit(1);

      if (error) {
        console.error('Error fetching user score:', error);
        throw error;
      }

      console.log('User score data:', data);
      return data?.[0] || { score: 0, perfect_match: false };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: userRank } = useQuery({
    queryKey: ['user-rank'],
    enabled: !!currentUser && !!userScore,
    queryFn: async () => {
      console.log('Calculating user rank...');
      if (!userScore?.score) return "N/A";

      const { count, error } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', userScore.score);

      if (error) {
        console.error('Error calculating rank:', error);
        throw error;
      }

      const rank = (count || 0) + 1;
      console.log('User rank:', rank);
      return rank;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Classement Joueurs
      </h2>

      {currentUser && (
        <Card className="p-4 bg-gold/5 border-gold mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-rich-black">Votre score</p>
              <p className="text-sm text-rich-black/60">Position #{userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-rich-black">{userScore?.score || 0}</p>
              <p className="text-sm text-rich-black/60">points</p>
            </div>
          </div>
        </Card>
      )}

      {leaderboard?.map((entry, index) => (
        <Card key={entry.user_id} className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="font-bold text-gold">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-rich-black">{entry.username}</p>
              {entry.perfect_match && (
                <p className="text-sm text-gold">Perfect Match! 🎯</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-rich-black">{entry.score}</p>
              <p className="text-sm text-rich-black/60">points</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}