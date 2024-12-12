import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useImageToggleStore } from "@/store/useImageToggleStore";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Candidates() {
  const { showOfficialPhoto, toggleImage } = useImageToggleStore();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-16 z-10 bg-cream/95 backdrop-blur-sm py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center font-playfair text-gold">
            Candidates Miss France 2024
          </h1>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rich-black/40" />
              <Input
                type="text"
                placeholder="Rechercher une candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4 bg-white/80 rounded-full px-8 py-3 shadow-sm">
              <span 
                onClick={toggleImage}
                className={`text-base font-medium transition-colors cursor-pointer select-none ${showOfficialPhoto ? 'text-gold' : 'text-rich-black/40'}`}
              >
                Portrait Officiel 🤵‍♀️
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleImage}
                className="hover:bg-gold/10 relative w-16 h-8 rounded-full bg-white shadow-md"
              >
                <div className={`absolute w-6 h-6 rounded-full bg-gold transition-all duration-300 ${showOfficialPhoto ? 'left-1.5' : 'left-9'}`} />
              </Button>
              <span 
                onClick={toggleImage}
                className={`text-base font-medium transition-colors cursor-pointer select-none ${!showOfficialPhoto ? 'text-gold' : 'text-rich-black/40'}`}
              >
                👙 Maillot de bain
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 pb-6">
        <CandidatesGrid searchQuery={searchQuery} />
      </div>
    </div>
  );
}