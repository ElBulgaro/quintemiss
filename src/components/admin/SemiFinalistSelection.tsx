import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Candidate } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSemiFinalistRankings } from "@/hooks/admin/use-semi-finalist-rankings";

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
  const { isSaving, handleToggleSemiFinalist } = useSemiFinalistRankings();

  // Query to check if user is admin
  const { data: profile, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleToggle = async (candidateId: string) => {
    if (isSaving) return;

    const updatedSemiFinalists = await handleToggleSemiFinalist(
      candidateId,
      semiFinalists,
      !!profile?.is_admin
    );

    if (updatedSemiFinalists) {
      onToggleSemiFinalist(candidateId);
    }
  };

  if (isCheckingAdmin) {
    return <div>Checking permissions...</div>;
  }

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
                  src={candidate.image_url}
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