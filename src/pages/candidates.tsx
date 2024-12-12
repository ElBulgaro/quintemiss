import { useState } from "react";
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
  const [singleColumn, setSingleColumn] = useState(false); // Default to two columns
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="sticky top-16 z-10 bg-cream/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center font-playfair text-gold animate-fade-down mb-6">
            Candidates Miss France 2024
          </h1>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-16">
            {isMobile && (
              <div className="w-full max-w-xs">
                <Input
                  type="text"
                  placeholder="Rechercher une candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                />
                <Search className="absolute -translate-y-[30px] left-3 h-4 w-4 text-rich-black/40" />
              </div>
            )}
            
            <div className="flex items-center gap-3">
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
            </div>

            {isMobile && (
              <div className="flex justify-center">
                <ColumnToggle singleColumn={singleColumn} onToggle={setSingleColumn} />
              </div>
            )}

            {!isMobile && (
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rich-black/40" />
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