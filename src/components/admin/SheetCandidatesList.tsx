import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SheetCandidate = Database['public']['Tables']['sheet_candidates']['Row'];

export function SheetCandidatesList() {
  const { data: sheetCandidates, isLoading, error, refetch } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      console.log('Fetching sheet candidates...');
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching sheet candidates:', error);
        throw error;
      }
      
      console.log('Fetched sheet candidates:', data);
      return data;
    },
  });

  const handlePromote = async (candidate: SheetCandidate) => {
    try {
      console.log('Promoting candidate:', candidate);
      const { error: insertError } = await supabase
        .from('candidates')
        .insert({
          name: candidate.name,
          region: candidate.region,
          bio: candidate.bio,
          age: candidate.age,
          instagram: candidate.instagram,
          image_url: candidate.image_url || '',
          official_photo_url: candidate.official_photo_url,
          portrait_url: candidate.portrait_url,
        });

      if (insertError) throw insertError;
      
      toast.success(`${candidate.name} promoted to candidates`);
      await refetch();
    } catch (error) {
      console.error('Error promoting candidate:', error);
      toast.error("Failed to promote candidate");
    }
  };

  if (error) {
    console.error('Error in SheetCandidatesList:', error);
    return (
      <div className="p-4 text-red-500">
        Error loading sheet candidates: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading sheet candidates...</div>;
  }

  if (!sheetCandidates?.length) {
    return (
      <div className="p-4 text-muted-foreground">
        No candidates found in the sheet. Try syncing with Google Sheets first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Sheet Candidates ({sheetCandidates?.length || 0})</h2>
      <div className="grid gap-4">
        {sheetCandidates?.map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <img
                  src={candidate.image_url || '/placeholder.svg'}
                  alt={candidate.name}
                  className="h-16 w-16 object-cover rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {candidate.region} • {candidate.age} ans
                  </p>
                  {candidate.instagram && (
                    <a 
                      href={`https://instagram.com/${candidate.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {candidate.instagram}
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePromote(candidate)}
              >
                Promote to Candidate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}