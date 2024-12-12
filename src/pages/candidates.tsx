import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Button } from "@/components/ui/button";
import { Shirt } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";

export default function Candidates() {
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-rich-black">
            Candidates Miss France 2024
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleImage}
            className="hover:bg-gold/10"
            title={showOfficialPhoto ? "Voir en maillot" : "Voir en costume"}
          >
            <Shirt className={`h-5 w-5 ${showOfficialPhoto ? 'text-gold' : 'text-rich-black/60'}`} />
          </Button>
        </div>
        <CandidatesGrid />
      </div>
    </div>
  );
}