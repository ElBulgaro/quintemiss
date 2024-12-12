import { Link } from "react-router-dom";

interface NavigationLinksProps {
  isAdmin: boolean;
}

export function NavigationLinks({ isAdmin }: NavigationLinksProps) {
  return (
    <>
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
    </>
  );
}