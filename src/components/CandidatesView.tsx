import { useQuery } from "@tanstack/react-query";
import { CandidateCard } from "@/components/CandidateCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Shirt } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import type { Candidate } from "@/data/candidates";

interface CandidatesViewProps {
  viewMode: 'grid-2' | 'grid-3' | 'list';
  selectedCandidates: string[];
  onCandidateSelect: (id: string) => void;
}

export function CandidatesView({
  viewMode,
  selectedCandidates,
  onCandidateSelect,
}: CandidatesViewProps) {
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className={`${
        viewMode === 'list'
          ? 'flex flex-col gap-4'
          : viewMode === 'grid-3'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'grid grid-cols-1 md:grid-cols-2 gap-4'
      }`}>
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-rich-black">Candidates</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleImage}
            className="hover:bg-gold/10"
            title={showOfficialPhoto ? "Voir en maillot" : "Voir en costume"}
          >
            <Shirt className={`h-5 w-5 ${showOfficialPhoto ? 'text-gold' : 'text-rich-black/60'}`} />
          </Button>
        </div>
      </div>
      <div
        className={`${
          viewMode === 'list'
            ? 'flex flex-col gap-4'
            : viewMode === 'grid-3'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }`}
      >
        {candidates?.map((candidate) => (
          <div
            key={candidate.id}
            className="cursor-pointer"
            onClick={() => onCandidateSelect(candidate.id)}
          >
            {viewMode === 'list' ? (
              <div
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  selectedCandidates.includes(candidate.id)
                    ? 'bg-gold/10 border-gold'
                    : 'bg-white/50 border-white/20'
                } border shadow-sm hover:shadow-md transition-all`}
              >
                <div className="relative w-16 h-16 overflow-hidden rounded-full flex-shrink-0">
                  <img
                    src={candidate.image_url}
                    alt={candidate.name}
                    className="absolute w-[120%] h-[120%] object-cover object-top left-1/2 -translate-x-1/2"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-rich-black">{candidate.name}</h3>
                  <p className="text-sm text-rich-black/60">{candidate.region}</p>
                </div>
              </div>
            ) : (
              <CandidateCard
                {...candidate}
                selected={selectedCandidates.includes(candidate.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}