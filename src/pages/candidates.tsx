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
    <div className="min-h-screen bg-cream pt-16"> {/* Added pt-16 to account for the fixed navbar */}
      <div className="sticky top-16 z-10 bg-cream/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"> {/* Increased vertical padding */}
          <h1 className="text-3xl md:text-4xl font-bold text-center font-playfair text-gold">
            Candidates Miss France 2024
          </h1>
          
          <div className="flex justify-center items-center gap-16">
            <div className="flex items-center gap-3">
              <span 
                onClick={toggleImage}
                className={`text-sm transition-colors cursor-pointer select-none ${showOfficialPhoto ? 'text-gold font-medium' : 'text-rich-black/60 hover:text-rich-black/80'}`}
              >
                Portrait Officiel 🤵‍♀️
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleImage}
                className="hover:bg-gold/10 relative w-14 h-7 rounded-full bg-rich-black/5"
              >
                <div className={`absolute w-5 h-5 rounded-full bg-gold transition-all duration-300 ${showOfficialPhoto ? 'left-1' : 'left-8'}`} />
              </Button>
              <span 
                onClick={toggleImage}
                className={`text-sm transition-colors cursor-pointer select-none ${!showOfficialPhoto ? 'text-gold font-medium' : 'text-rich-black/60 hover:text-rich-black/80'}`}
              >
                👙 Maillot de bain
              </span>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rich-black/40" />
              <Input
                type="text"
                placeholder="Rechercher une candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <CandidatesGrid searchQuery={searchQuery} />
      </div>
    </div>
  );
}