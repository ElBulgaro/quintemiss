import { useState, useEffect } from "react";
import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ColumnToggle } from "@/components/ColumnToggle";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [singleColumn, setSingleColumn] = useState(false);
  const isMobile = useIsMobile();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div 
        className={`sticky ${isNavVisible ? 'top-16' : 'top-0'} z-10 bg-cream/95 backdrop-blur-sm shadow-sm transition-[top] duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center font-playfair text-gold animate-fade-down whitespace-nowrap">
            Candidates Miss France 2026
          </h1>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-16 mt-6">
            <div className="w-full max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rich-black/40 pointer-events-none" />
              <Input
                type="text"
                placeholder="Rechercher une candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
              />
            </div>

            {isMobile && (
              <ColumnToggle singleColumn={singleColumn} onToggle={setSingleColumn} />
            )}
          </div>
        </div>
      </div>

      <div className="py-6 animate-fade-up">
        <CandidatesGrid searchQuery={searchQuery} singleColumn={isMobile && singleColumn} />
      </div>
    </div>
  );
}