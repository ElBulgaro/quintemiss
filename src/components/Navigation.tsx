import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAdmin = true;

  useEffect(() => {
    // Check initial auth state
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAuthenticated(true);
      setUsername(userData.username);
    }

    // Listen for auth state changes
    const handleAuthChange = () => {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUsername(userData.username);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    try {
      // Clear user authentication
      localStorage.removeItem('user');
      // Clear predictions
      localStorage.removeItem('predictions');
      // Dispatch auth state change event
      window.dispatchEvent(new Event('auth-state-changed'));
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
              <div className="flex items-center gap-4">
                <span className="text-rich-black/80">{username}</span>
                <Button variant="outline" size="sm" className="hover-lift" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
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
            {isAuthenticated && (
              <div className="px-3 py-2 text-rich-black/80">
                {username}
              </div>
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