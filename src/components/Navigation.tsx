import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

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
            <Button variant="outline" size="sm" className="hover-lift">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
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
            <div className="px-3 py-2">
              <Button variant="outline" size="sm" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}