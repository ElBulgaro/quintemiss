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

  const getGridClasses = () => {
    // List view
    if (viewMode === 'list') {
      return 'flex flex-col gap-3';
    }
    
    // Base grid setup with consistent gap
    const baseClasses = 'grid gap-3';
    
    // Grid columns based on viewMode
    // grid-2: Always 1 column on small mobile, 2 columns from sm breakpoint up
    // grid-3: 1 column on mobile, then scales up
    if (viewMode === 'grid-2') {
      return `${baseClasses} grid-cols-1 sm:grid-cols-2`;
    }
    
    // For grid-3, we use a single column on mobile, 2 columns on medium devices, 3 on large
    return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
  };

  if (isLoading) {
    return (
      <div className={getGridClasses()}>
        {[...Array(6)].map((_, index) => (
          <Skeleton 
            key={index} 
            className={viewMode === 'list' ? "h-24" : "h-[400px]"}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={getGridClasses()}>
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
  );
}