import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";
import { useEffect } from "react";

const POSITION_LABELS = {
  1: "MISS FRANCE 2025",
  2: "1ERE DAUPHINE",
  3: "2EME DAUPHINE",
  4: "3EME DAUPHINE",
  5: "4EME DAUPHINE"
};

export function OfficialResults() {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'official_results'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['officialResults'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: officialResults } = useQuery({
    queryKey: ['officialResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('official_results')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
  });

  const { data: candidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('region');
      
      if (error) throw error;
      return data as Candidate[];
    },
  });

  if (!candidates) {
    return <div>Loading...</div>;
  }

  // If there are no official results, show a message
  if (!officialResults) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
          <Trophy className="h-6 w-6 text-gold" />
          Classement Officiel
        </h2>
        <Card className="p-6">
          <p className="text-center text-rich-black/60">
            Les résultats officiels ne sont pas encore disponibles.
          </p>
        </Card>
      </div>
    );
  }

  const getPositionLabel = (candidateId: string): string => {
    if (!officialResults) return "?";

    const finalRanking = officialResults.final_ranking || [];
    const semiFinalists = officialResults.semi_finalists || [];
    
    // Check if candidate is in final ranking
    const position = finalRanking.indexOf(candidateId) + 1;
    if (position > 0) {
      return POSITION_LABELS[position as keyof typeof POSITION_LABELS] || "TOP 5";
    }
    
    // If semi-finalists are set and candidate is in it, show TOP 15
    if (semiFinalists.length > 0) {
      if (semiFinalists.includes(candidateId)) {
        return "TOP 15";
      }
      // If semi-finalists are set but candidate is not in it, show X
      return "X";
    }

    return "?";
  };

  // Sort candidates based on their position
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aPosition = officialResults?.final_ranking?.indexOf(a.id) ?? -1;
    const bPosition = officialResults?.final_ranking?.indexOf(b.id) ?? -1;
    
    // If both are in final ranking, sort by position
    if (aPosition !== -1 && bPosition !== -1) {
      return aPosition - bPosition;
    }
    
    // If only one is in final ranking, it comes first
    if (aPosition !== -1) return -1;
    if (bPosition !== -1) return 1;
    
    // If neither is in final ranking, check TOP 15
    const aInTop15 = officialResults?.semi_finalists?.includes(a.id) ?? false;
    const bInTop15 = officialResults?.semi_finalists?.includes(b.id) ?? false;
    
    // If both or neither are in TOP 15, sort by region
    if (aInTop15 === bInTop15) {
      return a.region.localeCompare(b.region);
    }
    
    // TOP 15 candidates come before non-TOP 15
    return aInTop15 ? -1 : 1;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Classement Officiel
      </h2>

      <div className="space-y-4">
        {sortedCandidates.map((candidate) => {
          const positionLabel = getPositionLabel(candidate.id);
          return (
            <Card key={candidate.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  positionLabel === "X" 
                    ? "bg-red-100" 
                    : positionLabel === "?" 
                    ? "bg-gray-100" 
                    : "bg-gold/10"
                }`}>
                  {positionLabel === "X" ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : (
                    <span className={`font-bold ${
                      positionLabel === "?" 
                        ? "text-gray-500" 
                        : "text-gold"
                    }`}>
                      {positionLabel}
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}