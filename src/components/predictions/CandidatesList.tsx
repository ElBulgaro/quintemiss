import { ViewToggle } from "@/components/ViewToggle";
import { CandidatesView } from "@/components/CandidatesView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Search, Shirt } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CandidatesListProps {
  viewMode: 'grid-2' | 'grid-3' | 'list';
  selectedCandidates: string[];
  onViewChange: (mode: 'grid-2' | 'grid-3' | 'list') => void;
  onCandidateSelect: (id: string) => void;
}

export const CandidatesList = ({
  viewMode,
  selectedCandidates,
  onViewChange,
  onCandidateSelect,
}: CandidatesListProps) => {
  const isMobile = useIsMobile();
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="glass-card p-6 rounded-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-rich-black">Candidates</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleImage}
            className="hover:bg-gold/10"
            title={showOfficialPhoto ? "Voir en maillot" : "Voir en costume"}
          >
            <Shirt className={`h-5 w-5 ${showOfficialPhoto ? 'text-gold' : 'text-rich-black/60'}`} />
          </Button>
          <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-16 mb-6">
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
          <div className="flex items-center gap-6">
            <Button 
              variant="outline"
              onClick={toggleImage}
              className="text-xs h-8 px-2 shadow-sm hover:shadow-md transition-all bg-white/50"
            >
              {showOfficialPhoto ? 'Portrait Officiel 🤵‍♀️' : 'Maillot de bain 👙'}
            </Button>
          </div>
        )}
      </div>

      <div className={`${isMobile ? 'h-full' : 'max-h-[600px]'} flex-1 overflow-y-auto`}>
        <CandidatesView
          viewMode={viewMode}
          selectedCandidates={selectedCandidates}
          onCandidateSelect={onCandidateSelect}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};