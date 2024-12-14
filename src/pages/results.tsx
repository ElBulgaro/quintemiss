import { motion } from "framer-motion";
import { OfficialResults } from "@/components/results/OfficialResults";
import { Leaderboard } from "@/components/predictions/Leaderboard";
import { ScoreExplanation } from "@/components/results/ScoreExplanation";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Results() {
  const isMobile = useIsMobile();
  const [openSections, setOpenSections] = useState({
    scoreExplanation: true,
    officialResults: true,
    leaderboard: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ 
    title, 
    isOpen, 
    onClick 
  }: { 
    title: string; 
    isOpen: boolean; 
    onClick: () => void;
  }) => (
    <CollapsibleTrigger
      className="flex items-center justify-between w-full py-2 text-left"
      onClick={onClick}
    >
      <h2 className="text-xl font-playfair font-bold text-rich-black">{title}</h2>
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-rich-black/60" />
      ) : (
        <ChevronDown className="h-5 w-5 text-rich-black/60" />
      )}
    </CollapsibleTrigger>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container py-8 space-y-8"
    >
      <h1 className="text-4xl font-playfair font-bold text-rich-black">Résultats</h1>
      
      <div className={`grid gap-8 ${isMobile ? '' : 'lg:grid-cols-2'}`}>
        <div className="space-y-8">
          {isMobile ? (
            <>
              <Collapsible
                open={openSections.scoreExplanation}
                className="border rounded-lg p-4"
              >
                <SectionHeader
                  title="Système de Points"
                  isOpen={openSections.scoreExplanation}
                  onClick={() => toggleSection('scoreExplanation')}
                />
                <CollapsibleContent className="pt-4">
                  <ScoreExplanation />
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={openSections.officialResults}
                className="border rounded-lg p-4"
              >
                <SectionHeader
                  title="Résultats Officiels"
                  isOpen={openSections.officialResults}
                  onClick={() => toggleSection('officialResults')}
                />
                <CollapsibleContent className="pt-4">
                  <OfficialResults />
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={openSections.leaderboard}
                className="border rounded-lg p-4"
              >
                <SectionHeader
                  title="Classement"
                  isOpen={openSections.leaderboard}
                  onClick={() => toggleSection('leaderboard')}
                />
                <CollapsibleContent className="pt-4">
                  <Leaderboard />
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : (
            <OfficialResults />
          )}
        </div>
        {!isMobile && (
          <div className="space-y-8">
            <ScoreExplanation />
            <Leaderboard />
          </div>
        )}
      </div>
    </motion.div>
  );
}