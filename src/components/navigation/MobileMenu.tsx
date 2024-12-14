import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

interface MobileMenuProps {
  isAdmin: boolean;
  isAuthenticated: boolean;
  username: string | null;
  onClose: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

export function MobileMenu({
  isAdmin,
  isAuthenticated,
  username,
  onClose,
  onLogout,
  onLogin
}: MobileMenuProps) {
  return (
    <div className="md:hidden bg-white border-b">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <Link
          to="/candidates"
          className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
          onClick={onClose}
        >
          Candidates
        </Link>
        <Link
          to="/predictions"
          className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
          onClick={onClose}
        >
          Predictions
        </Link>
        <Link
          to="/results"
          className="block px-3 py-2 text-rich-black/80 hover:text-rich-black transition-colors"
          onClick={onClose}
        >
          Résultats
        </Link>
        {isAuthenticated && (
          <div className="px-3 py-2 text-rich-black/80">
            {username}
          </div>
        )}
        <div className="px-3 py-2">
          {isAuthenticated ? (
            <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={onLogin}>
              <User className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}