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
      return session.user;
    },
  });

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('user_id, score, perfect_match')
        .order('score', { ascending: false })
        .limit(10);

      if (scoresError) throw scoresError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', scores.map(score => score.user_id));

      if (profilesError) throw profilesError;

      const combinedData = scores.map(score => {
        const profile = profiles.find(p => p.id === score.user_id);
        return {
          ...score,
          username: profile?.username || 'Anonymous User'
        };
      });

      return combinedData;
    },
  });

  const { data: userScore } = useQuery({
    queryKey: ['user-score'],
    enabled: !!currentUser,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', currentUser?.id)
        .limit(1);  // Add limit to ensure we only get one row

      if (error) throw error;
      
      // Return the first score or a default score object
      return data?.[0] || { score: 0 };
    },
  });

  const { data: userRank } = useQuery({
    queryKey: ['user-rank'],
    enabled: !!currentUser && !!userScore,
    queryFn: async () => {
      // If user has no score yet, they're last
      if (!userScore?.score) return "N/A";

      const { count, error } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', userScore.score || 0);

      if (error) throw error;
      return (count || 0) + 1;
    },
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