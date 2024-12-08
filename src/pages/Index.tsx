import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        setIsAdmin(!!profile?.is_admin);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-rich-black mb-6">
              Miss France 2024
              <br />
              <span className="text-gold">Faites vos jeux</span>
            </h1>
            <p className="text-lg md:text-xl text-rich-black/60 max-w-2xl mx-auto mb-8">
              Prédisez les 5 finalistes de Miss France 2024 et comparez vos résultats avec ceux des autres participants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/predictions")}
                className="hover-lift"
              >
                Faire mes prédictions
              </Button>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/admin/candidates")}
                  className="hover-lift"
                >
                  Gérer les candidates
                </Button>
              )}
            </div>
          </div>

          <CandidatesGrid />
        </div>
      </main>
    </div>
  );
}