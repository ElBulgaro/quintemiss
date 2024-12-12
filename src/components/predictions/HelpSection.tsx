import { Info, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function HelpSection() {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-gold" />
        <h3 className="text-lg font-medium">Comment ça marche ?</h3>
      </div>
      <ol className="space-y-4 text-rich-black/80">
        <li className="flex items-start gap-2">
          <span className="font-bold">1.</span>
          Sélectionnez 5 candidates parmi toutes les Miss
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">2.</span>
          Classez-les par glisser-déposer selon vos prédictions
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">3.</span>
          Validez vos choix et comparez avec les autres joueurs!
        </li>
      </ol>
      <Button 
        variant="outline" 
        className="w-full mt-6"
        onClick={() => navigate("/leaderboard")}
      >
        <Trophy className="h-4 w-4 mr-2" />
        Voir le classement
      </Button>
    </div>
  );
}