import { useState, useEffect } from "react";
import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import { Input } from "@/components/ui/input";
import { ColumnToggle } from "@/components/ColumnToggle";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Candidates() {
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();
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
            Candidates Miss France 2024
          </h1>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-16 mt-6">
            {isMobile && (
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
            )}
            
            <div className="flex items-center gap-6">
              {isMobile ? (
                <Button 
                  variant="outline"
                  onClick={toggleImage}
                  className="text-xs h-8 px-2 shadow-sm hover:shadow-md transition-all bg-white/50"
                >
                  {showOfficialPhoto ? '👙 Maillot de bain' : '🤵‍♀️ Portrait officiel'}
                </Button>
              ) : (
                <>
                  <span 
                    onClick={toggleImage}
                    className={`text-sm transition-colors cursor-pointer select-none ${showOfficialPhoto ? 'text-gold font-medium' : 'text-rich-black/60 hover:text-rich-black/80'}`}
                  >
                    Portrait Officiel 🤵‍♀️
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleImage}
                    className="hover:bg-gold/10 relative w-14 h-7 rounded-full bg-rich-black/5 transition-all duration-500"
                  >
                    <div className={`absolute w-5 h-5 rounded-full bg-gold transition-all duration-500 ${showOfficialPhoto ? 'left-1' : 'left-8'}`} />
                  </Button>
                  <span 
                    onClick={toggleImage}
                    className={`text-sm transition-colors cursor-pointer select-none ${!showOfficialPhoto ? 'text-gold font-medium' : 'text-rich-black/60 hover:text-rich-black/80'}`}
                  >
                    👙 Maillot de bain
                  </span>
                </>
              )}

              {isMobile && (
                <ColumnToggle singleColumn={singleColumn} onToggle={setSingleColumn} />
              )}
            </div>

            {!isMobile && (
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rich-black/40 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Rechercher une candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                />
              </div>
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