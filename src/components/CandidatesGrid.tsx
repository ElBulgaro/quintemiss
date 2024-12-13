import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CandidateCard } from "./CandidateCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface CandidatesGridProps {
  searchQuery?: string;
  singleColumn?: boolean;
}

export function CandidatesGrid({ searchQuery = "", singleColumn = false }: CandidatesGridProps) {
  const isMobile = useIsMobile();
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      console.log('Fetching sheet candidates...');
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('region')
        .order('name');
      
      if (error) {
        console.error('Error fetching sheet candidates:', error);
        throw error;
      }

      console.log('Fetched sheet candidates:', data);
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
      <div className={`container grid ${isMobile ? (singleColumn ? 'grid-cols-1' : 'grid-cols-2') : (singleColumn ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')} ${isMobile ? 'gap-3 px-2' : 'gap-6 px-4 sm:px-6 lg:px-8'} max-w-7xl mx-auto`}>
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
      className={`container grid ${isMobile ? (singleColumn ? 'grid-cols-1' : 'grid-cols-2') : (singleColumn ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')} ${isMobile ? 'gap-3 px-2' : 'gap-6 px-4 sm:px-6 lg:px-8'} max-w-7xl mx-auto`}
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