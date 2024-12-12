import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CandidateCard } from "./CandidateCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

interface CandidatesGridProps {
  searchQuery?: string;
  singleColumn?: boolean;
}

export function CandidatesGrid({ searchQuery = "", singleColumn = false }: CandidatesGridProps) {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('region')
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
      <div className={`grid ${singleColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
        {[...Array(6)].map((_, index) => (
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
      className={`grid ${singleColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filteredCandidates?.map((candidate) => (
        <div
          key={candidate.id}
          className="hover-lift"
        >
          <CandidateCard {...candidate} />
        </div>
      ))}
    </motion.div>
  );
}