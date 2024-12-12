import { UserPlus } from 'lucide-react';

interface PredictionsHeaderProps {
  selectedCount: number;
}

export function PredictionsHeader({ selectedCount }: PredictionsHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-6xl font-bold text-rich-black mb-6">
        Vos Prédictions
        <br />
        <span className="text-gold">Top 5</span>
      </h1>
      <p className="text-lg md:text-xl text-rich-black/60 max-w-2xl mx-auto mb-8">
        Sélectionnez et classez vos 5 candidates favorites pour le titre de Miss France 2024
      </p>
      
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gold" />
          <span className="text-lg font-medium">
            {selectedCount}/5 sélectionnées
          </span>
        </div>
      </div>
    </div>
  );
}