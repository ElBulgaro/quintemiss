import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  user_id: string;
  score: number;
  perfect_match: boolean;
  profiles: {
    username: string | null;
  };
}

export function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // First get the scores
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('user_id, score, perfect_match')
        .order('score', { ascending: false })
        .limit(10);

      if (scoresError) throw scoresError;

      // Then get the usernames for these scores
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', scores.map(score => score.user_id));

      if (profilesError) throw profilesError;

      // Combine the data
      const combinedData = scores.map(score => {
        const profile = profiles.find(p => p.id === score.user_id);
        return {
          ...score,
          profiles: {
            username: profile?.username
          }
        };
      });

      return combinedData.map(entry => ({
        ...entry,
        username: entry.profiles.username || 'Anonymous User'
      })) as (Omit<LeaderboardEntry, 'profiles'> & { username: string })[];
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
        Classement
      </h2>
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