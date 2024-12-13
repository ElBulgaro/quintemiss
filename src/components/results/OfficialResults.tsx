import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/types";
import { useEffect } from "react";

const POSITION_LABELS = {
  miss_france: "MISS FRANCE 2025",
  top5: "TOP 5",
  "1ere_dauphine": "1ERE DAUPHINE",
  "2eme_dauphine": "2EME DAUPHINE",
  "3eme_dauphine": "3EME DAUPHINE",
  "4eme_dauphine": "4EME DAUPHINE",
  top15: "TOP 15",
  inconnu: "RÉSULTAT INCONNU",
  eliminee: "ÉLIMINÉE"
};

const RANKING_ORDER = [
  'miss_france',
  'top5',
  '1ere_dauphine',
  '2eme_dauphine',
  '3eme_dauphine',
  '4eme_dauphine',
  'top15',
  'inconnu',
  'eliminee'
];

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
          table: 'sheet_candidates'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sheet-candidates'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
          Classement Officiel
        </h2>
        <Card className="p-6">
          <p className="text-center text-rich-black/60">
            Chargement des résultats...
          </p>
        </Card>
      </div>
    );
  }

  if (!candidates?.length) {
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

  const sortedCandidates = [...candidates].sort((a, b) => {
    const rankingA = a.ranking || 'inconnu';
    const rankingB = b.ranking || 'inconnu';
    
    const indexA = RANKING_ORDER.indexOf(rankingA);
    const indexB = RANKING_ORDER.indexOf(rankingB);
    
    if (indexA === indexB) {
      return a.region.localeCompare(b.region);
    }
    
    return indexA - indexB;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-playfair font-bold text-rich-black flex items-center gap-2">
        <Trophy className="h-6 w-6 text-gold" />
        Classement Officiel
      </h2>

      <div className="space-y-4">
        {sortedCandidates.map((candidate) => {
          const ranking = candidate.ranking || 'inconnu';
          const positionLabel = POSITION_LABELS[ranking as keyof typeof POSITION_LABELS];
          
          return (
            <Card key={candidate.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  ranking === "eliminee" 
                    ? "bg-red-100" 
                    : ranking === "inconnu" 
                    ? "bg-gray-100" 
                    : "bg-gold/10"
                }`}>
                  {ranking === "eliminee" ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : (
                    <span className={`text-xs font-bold ${
                      ranking === "inconnu" 
                        ? "text-gray-500" 
                        : "text-gold"
                    }`}>
                      {ranking === 'miss_france' ? '👑' : ranking === 'top5' ? '5' : ranking === 'top15' ? '15' : ''}
                    </span>
                  )}
                </div>
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
                      <span className="hidden sm:inline text-muted-foreground">•</span>
                      <p className="text-sm font-medium text-rich-black/60">
                        {positionLabel}
                      </p>
                    </div>
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