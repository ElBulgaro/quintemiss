import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  // Temporary mock admin state - you'll need to integrate this with your auth system
  const isAdmin = true;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-playfair text-2xl font-bold text-rich-black">
              Quinté Miss
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/candidates" className="text-rich-black/80 hover:text-rich-black transition-colors">
              Candidates
            </Link>
            <Link to="/predictions" className="text-rich-black/80 hover:text-rich-black transition-colors">
              Predictions
            </Link>
            <Link to="/leaderboard" className="text-rich-black/80 hover:text-rich-black transition-colors">
              Leaderboard
            </Link>
            {isAdmin && (
              <Link to="/admin/candidates" className="text-rich-black/80 hover:text-rich-black transition-colors">
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" className="hover-lift" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="hover-lift" onClick={() => navigate("/login")}>
                <User className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-rich-black"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/candidates"
              className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Candidates
            </Link>
            <Link
              to="/predictions"
              className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Predictions
            </Link>
            <Link
              to="/leaderboard"
              className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Leaderboard
            </Link>
            {isAdmin && (
              <Link
                to="/admin/candidates"
                className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            <div className="px-3 py-2">
              {isAuthenticated ? (
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/login")}>
                  <User className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}