import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

export function OfficialResults() {
  const { data: officialResults, isLoading } = useQuery({
    queryKey: ['officialResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('official_results')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: candidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*');
      
      if (error) throw error;
      return data as Candidate[];
    },
  });

  if (isLoading || !candidates) {
    return <div>Loading...</div>;
  }

  if (!officialResults?.final_ranking?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Les résultats officiels ne sont pas encore disponibles.
        </p>
      </Card>
    );
  }

  const getCandidate = (id: string) => candidates.find(c => c.id === id);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Classement Officiel
      </h2>

      <div className="space-y-4">
        {officialResults.final_ranking.map((candidateId: string, index: number) => {
          const candidate = getCandidate(candidateId);
          if (!candidate) return null;

          return (
            <Card key={candidateId} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="font-bold text-gold">{index + 1}</span>
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}