import { forwardRef } from "react";
import { Crown } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  region: string;
  image_url: string | null;
}

interface CollageCanvasProps {
  candidates: Candidate[];
}

const positionLabels = [
  { label: "Miss France 2026", icon: true },
  { label: "1ère Dauphine", icon: false },
  { label: "2ème Dauphine", icon: false },
  { label: "3ème Dauphine", icon: false },
  { label: "4ème Dauphine", icon: false },
];

export const CollageCanvas = forwardRef<HTMLDivElement, CollageCanvasProps>(
  ({ candidates }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[540px] h-[675px] bg-gradient-to-br from-rose-900 via-pink-800 to-amber-700 p-6 flex flex-col"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Mon Top 5
          </h1>
          <p className="text-amber-200 text-sm font-medium">Miss France 2026</p>
        </div>

        {/* Miss France - Top */}
        {candidates[0] && (
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Crown className="h-8 w-8 text-amber-300 fill-amber-300" />
              </div>
              <div className="w-32 h-40 rounded-lg overflow-hidden border-4 border-amber-300 shadow-xl">
                <img
                  src={candidates[0].image_url || "/placeholder.svg"}
                  alt={candidates[0].region}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-300 text-rose-900 px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                {candidates[0].region}
              </div>
            </div>
          </div>
        )}

        {/* Dauphines Row 1 */}
        <div className="flex justify-center gap-4 mb-3 mt-4">
          {candidates.slice(1, 3).map((candidate, idx) => (
            <div key={candidate.id} className="relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white/90 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-bold z-10 shadow">
                {positionLabels[idx + 1].label}
              </div>
              <div className="w-24 h-32 rounded-lg overflow-hidden border-3 border-white/60 shadow-lg mt-2">
                <img
                  src={candidate.image_url || "/placeholder.svg"}
                  alt={candidate.region}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap shadow">
                {candidate.region}
              </div>
            </div>
          ))}
        </div>

        {/* Dauphines Row 2 */}
        <div className="flex justify-center gap-4 mt-4">
          {candidates.slice(3, 5).map((candidate, idx) => (
            <div key={candidate.id} className="relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white/80 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-bold z-10 shadow">
                {positionLabels[idx + 3].label}
              </div>
              <div className="w-20 h-28 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg mt-2">
                <img
                  src={candidate.image_url || "/placeholder.svg"}
                  alt={candidate.region}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/80 text-rose-900 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap shadow">
                {candidate.region}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto text-center">
          <p className="text-white/80 text-xs">
            quintemiss.lovable.app
          </p>
        </div>
      </div>
    );
  }
);

CollageCanvas.displayName = "CollageCanvas";
