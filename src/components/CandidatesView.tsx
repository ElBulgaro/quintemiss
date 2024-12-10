import { useQuery } from "@tanstack/react-query";
import { CandidateCard } from "@/components/CandidateCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import type { Candidate } from "@/data/types";

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
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={candidate.official_photo_url || candidate.image_url}
                  alt={candidate.name}
                  className="w-[150%] h-[150%] object-cover"
                  style={{
                    objectPosition: '50% 35%',
                    transform: 'translate(-16%, -16%)'
                  }}
                  crossOrigin="anonymous"
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
  );
}