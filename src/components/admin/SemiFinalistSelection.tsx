import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Candidate } from "@/data/candidates";
import { supabase } from "@/integrations/supabase/client";

interface SemiFinalistSelectionProps {
  candidates: Candidate[];
  semiFinalists: string[];
  onToggleSemiFinalist: (candidateId: string) => void;
}

export function SemiFinalistSelection({
  candidates,
  semiFinalists,
  onToggleSemiFinalist,
}: SemiFinalistSelectionProps) {
  const handleToggle = async (candidateId: string) => {
    if (semiFinalists.includes(candidateId)) {
      onToggleSemiFinalist(candidateId);
      await saveResults(semiFinalists.filter(id => id !== candidateId));
    } else if (semiFinalists.length < 15) {
      onToggleSemiFinalist(candidateId);
      await saveResults([...semiFinalists, candidateId]);
    } else {
      toast.error("Maximum 15 semi-finalists allowed");
    }
  };

  const saveResults = async (updatedSemiFinalists: string[]) => {
    try {
      // First try to fetch existing record
      const { data: existingResults } = await supabase
        .from('official_results')
        .select('*')
        .limit(1);

      const { error } = await supabase
        .from('official_results')
        .upsert({
          id: existingResults?.[0]?.id, // Use existing ID if available
          semi_finalists: updatedSemiFinalists,
          final_ranking: existingResults?.[0]?.final_ranking || [], // Preserve existing final ranking
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Semi-finalist selection saved");
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error("Failed to save selection");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-bold mb-4">Semi-Finalists Selection (Top 15)</h2>
      <p className="text-muted-foreground mb-4">
        Select up to 15 semi-finalists ({semiFinalists.length}/15 selected)
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id}
            className={`cursor-pointer transition-all duration-300 ${
              semiFinalists.includes(candidate.id) 
                ? 'bg-gold/5 border-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                : 'hover:bg-white/80'
            }`}
            onClick={() => handleToggle(candidate.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img
                  src={candidate.image}
                  alt={candidate.name}
                  className="h-12 w-12 object-cover rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.region}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}