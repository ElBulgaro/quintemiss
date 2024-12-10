import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { Candidate } from "@/data/types";

interface SortableCandidateProps {
  candidate: Candidate;
  index: number;
  onRemove: () => void;
}

export function SortableCandidate({ candidate, index, onRemove }: SortableCandidateProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-white/20 shadow-sm"
    >
      <button
        className="touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-rich-black/40" />
      </button>
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={candidate.official_photo_url || candidate.image_url}
            alt={candidate.name}
            className="absolute w-[300%] h-[300%] object-cover object-top left-1/2 -translate-x-1/2"
          />
        </div>
        <div>
          <p className="font-medium text-rich-black">
            {index + 1}. {candidate.name}
          </p>
          <p className="text-sm text-rich-black/60">{candidate.region}</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-rich-black/5 rounded-full transition-colors"
      >
        <X className="h-5 w-5 text-rich-black/40" />
      </button>
    </div>
  );
}