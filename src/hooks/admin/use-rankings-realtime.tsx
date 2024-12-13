import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRankingsRealtime(loadExistingRankings: () => Promise<void>) {
  useEffect(() => {
    const channel = supabase
      .channel('rankings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rankings' },
        () => {
          loadExistingRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadExistingRankings]);
}