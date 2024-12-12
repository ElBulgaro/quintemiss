import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Button } from "@/components/ui/button";
import { Shirt, Search } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Candidates() {
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();
  const [searchQuery, setSearchQuery] = useState("");

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
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rich-black/40" />
          <Input
            type="text"
            placeholder="Rechercher une candidate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CandidatesGrid searchQuery={searchQuery} />
      </div>
    </div>
  );
}