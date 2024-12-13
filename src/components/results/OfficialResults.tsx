import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";

const POSITION_LABELS = {
  1: "MISS FRANCE 2025",
  2: "1ERE DAUPHINE",
  3: "2EME DAUPHINE",
  4: "3EME DAUPHINE",
  5: "4EME DAUPHINE"
};

export function OfficialResults() {
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

  const getPositionLabel = (candidateId: string): string => {
    if (!officialResults) return "?";

    const finalRanking = officialResults.final_ranking || [];
    const semiFinalists = officialResults.semi_finalists || [];
    
    // Check if candidate is in final ranking
    const position = finalRanking.indexOf(candidateId) + 1;
    if (position > 0) {
      return POSITION_LABELS[position as keyof typeof POSITION_LABELS] || "TOP 5";
    }
    
    // Check if candidate is in semi-finalists
    if (semiFinalists.includes(candidateId)) {
      return "TOP 15";
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
    
    // If neither is in final ranking, sort by region
    return a.region.localeCompare(b.region);
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Classement Officiel
      </h2>

      <div className="space-y-4">
        {sortedCandidates.map((candidate) => (
          <Card key={candidate.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="font-bold text-gold">{getPositionLabel(candidate.id)}</span>
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
        ))}
      </div>
    </div>
  );
}