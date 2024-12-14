import { Trophy } from "lucide-react";

export function ResultsHeader() {
  return (
    <h2 className="hidden sm:flex text-2xl font-playfair font-bold text-rich-black items-center gap-2">
      <Trophy className="h-6 w-6 text-gold" />
      Résultats Officiels Miss France 2025
    </h2>
  );
}