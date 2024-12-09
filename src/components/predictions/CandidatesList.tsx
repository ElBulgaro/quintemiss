import { ViewToggle } from "@/components/ViewToggle";
import { CandidatesView } from "@/components/CandidatesView";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <div className="glass-card p-6 rounded-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-rich-black">Candidates</h2>
        <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
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