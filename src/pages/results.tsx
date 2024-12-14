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
      className="container py-8 space-y-8"
    >
      <h1 className="text-4xl font-playfair font-bold text-rich-black">Résultats</h1>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:order-1 order-2 space-y-8">
          <OfficialResults />
        </div>
        <div className="lg:order-2 order-1 space-y-8">
          <ScoreExplanation />
          <Leaderboard />
        </div>
      </div>
    </motion.div>
  );
}