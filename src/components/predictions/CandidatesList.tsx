import { CandidatesView } from "@/components/CandidatesView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import { Input } from "@/components/ui/input";
import { ColumnToggle } from "@/components/ColumnToggle";
import { useState } from "react";

interface CandidatesListProps {
  selectedCandidates: string[];
  onCandidateSelect: (id: string) => void;
}

export const CandidatesList = ({
  selectedCandidates,
  onCandidateSelect,
}: CandidatesListProps) => {
  const isMobile = useIsMobile();
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [singleColumn, setSingleColumn] = useState(false);

  return (
    <div className="min-h-screen bg-cream/95 backdrop-blur-sm">
      <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-16">
            {!isMobile && (
              <>
                <div className="flex items-center gap-6">
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
              </>
            )}

            {isMobile && (
              <>
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
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={toggleImage}
                    className="text-xs h-8 px-2 shadow-sm hover:shadow-md transition-all bg-white/50"
                  >
                    {showOfficialPhoto ? '🤵‍♀️ Portrait officiel' : '👙 Maillot de bain'}
                  </Button>
                  <ColumnToggle singleColumn={singleColumn} onToggle={setSingleColumn} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="py-6">
        <CandidatesView
          selectedCandidates={selectedCandidates}
          onCandidateSelect={onCandidateSelect}
          searchQuery={searchQuery}
          singleColumn={singleColumn}
        />
      </div>
    </div>
  );
};