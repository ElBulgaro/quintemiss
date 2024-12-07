import { CandidateCard } from "@/components/CandidateCard";
import type { Candidate } from "@/data/candidates";

interface CandidatesViewProps {
  candidates: Candidate[];
  viewMode: 'grid-2' | 'grid-3' | 'list';
  selectedCandidates: string[];
  onCandidateSelect: (id: string) => void;
}

export function CandidatesView({
  candidates,
  viewMode,
  selectedCandidates,
  onCandidateSelect,
}: CandidatesViewProps) {
  return (
    <div
      className={`${
        viewMode === 'list'
          ? 'flex flex-col gap-4'
          : viewMode === 'grid-3'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'grid grid-cols-1 md:grid-cols-2 gap-4'
      }`}
    >
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className="cursor-pointer"
          onClick={() => onCandidateSelect(candidate.id)}
        >
          {viewMode === 'list' ? (
            <div
              className={`flex items-center gap-4 p-4 rounded-lg ${
                selectedCandidates.includes(candidate.id)
                  ? 'bg-gold/10 border-gold'
                  : 'bg-white/50 border-white/20'
              } border shadow-sm hover:shadow-md transition-all`}
            >
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-16 h-16 object-cover rounded-full"
              />
              <div>
                <h3 className="font-medium text-rich-black">{candidate.name}</h3>
                <p className="text-sm text-rich-black/60">{candidate.region}</p>
              </div>
            </div>
          ) : (
            <CandidateCard
              {...candidate}
              selected={selectedCandidates.includes(candidate.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}