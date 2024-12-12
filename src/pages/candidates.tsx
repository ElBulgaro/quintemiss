import { CandidatesGrid } from "@/components/CandidatesGrid";

export default function Candidates() {
  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-rich-black mb-8">
          Candidates Miss France 2024
        </h1>
        <CandidatesGrid />
      </div>
    </div>
  );
}