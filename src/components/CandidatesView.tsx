import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CandidateCard } from "./CandidateCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import { useIsMobile } from "@/hooks/use-mobile";

interface CandidatesViewProps {
  selectedCandidates: string[];
  onCandidateSelect: (id: string) => void;
  searchQuery?: string;
  singleColumn?: boolean;
}

export function CandidatesView({
  selectedCandidates,
  onCandidateSelect,
  searchQuery = "",
  singleColumn = false,
}: CandidatesViewProps) {
  const { showOfficialPhoto } = useImageToggleStore();
  const isMobile = useIsMobile();
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

  const filteredCandidates = candidates?.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (candidate.bio?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={`grid ${isMobile ? (singleColumn ? 'grid-cols-1' : 'grid-cols-2') : (singleColumn ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')} ${isMobile ? 'gap-3 px-2' : 'gap-6 px-4'}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className={`grid ${isMobile ? (singleColumn ? 'grid-cols-1' : 'grid-cols-2') : (singleColumn ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')} ${isMobile ? 'gap-3 px-2' : 'gap-6 px-4'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filteredCandidates?.map((candidate) => (
        <div
          key={candidate.id}
          className="max-w-[400px] mx-auto w-full hover-lift"
        >
          <CandidateCard
            {...candidate}
            selected={selectedCandidates.includes(candidate.id)}
            onClick={() => onCandidateSelect(candidate.id)}
          />
        </div>
      ))}
    </motion.div>
  );
}