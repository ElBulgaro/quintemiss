import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

interface UserMenuProps {
  isAuthenticated: boolean;
  username: string | null;
  onLogout: () => void;
  onLogin: () => void;
}

export function UserMenu({ isAuthenticated, username, onLogout, onLogin }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span className="text-rich-black/80">{username}</span>
          <Button variant="outline" size="sm" className="hover-lift" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="hover-lift" onClick={onLogin}>
          <User className="h-4 w-4 mr-2" />
          Se connecter
        </Button>
      )}
    </div>
  );
}