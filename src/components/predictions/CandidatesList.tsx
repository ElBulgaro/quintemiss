import { ViewToggle } from "@/components/ViewToggle";
import { CandidatesView } from "@/components/CandidatesView";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Shirt } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";

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
      <div className={`${isMobile ? 'h-full' : 'max-h-[600px]'} flex-1 overflow-y-auto`}>
        <CandidatesView
          viewMode={viewMode}
          selectedCandidates={selectedCandidates}
          onCandidateSelect={onCandidateSelect}
        />
      </div>
    </div>
  );
};