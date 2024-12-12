import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { UserMenu } from "./navigation/UserMenu";
import { MobileMenu } from "./navigation/MobileMenu";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAdmin = true;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setIsAuthenticated(true);
          setUsername(profile.username);
        } else {
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUsername(null);
      } else if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setIsAuthenticated(true);
          setUsername(profile.username);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('predictions');
      setIsAuthenticated(false);
      setUsername(null);
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleLogin = () => {
    navigate("/login");
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
            <NavigationLinks isAdmin={isAdmin} />
            <UserMenu
              isAuthenticated={isAuthenticated}
              username={username}
              onLogout={handleLogout}
              onLogin={handleLogin}
            />
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
        <MobileMenu
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          username={username}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogout}
          onLogin={handleLogin}
        />
      )}
    </nav>
  );
}