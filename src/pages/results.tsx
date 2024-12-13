import { motion } from "framer-motion";
import { OfficialResults } from "@/components/results/OfficialResults";
import { Leaderboard } from "@/components/predictions/Leaderboard";
import { ScoreExplanation } from "@/components/results/ScoreExplanation";
import { Separator } from "@/components/ui/separator";

export default function Results() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container pt-24 pb-8 space-y-8" // Added pt-24 to account for the navigation bar
    >
      <h1 className="text-4xl font-playfair font-bold text-rich-black">Résultats</h1>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <OfficialResults />
          <ScoreExplanation />
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </motion.div>
  );
}