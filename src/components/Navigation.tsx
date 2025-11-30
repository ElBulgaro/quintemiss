import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { UserMenu } from "./navigation/UserMenu";
import { MobileMenu } from "./navigation/MobileMenu";
import { useQueryClient } from "@tanstack/react-query";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (profile) {
      setIsAuthenticated(true);
      setUsername(profile.username);
      setIsAdmin(!!roles);
    } else {
      handleLogout();
    }
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUsername(null);
        setIsAdmin(false);
        // Clear all queries from the cache
        queryClient.clear();
        navigate('/login');
      } else if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, navigate, queryClient]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUsername(null);
      setIsAdmin(false);
      localStorage.removeItem('user');
      localStorage.removeItem('predictions');
      // Clear all queries from the cache
      queryClient.clear();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className={`fixed w-full bg-white/80 backdrop-blur-sm border-b z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
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