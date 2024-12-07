import { motion } from "framer-motion";
import { CandidateCard } from "./CandidateCard";
import { candidates } from "@/data/candidates";

export function CandidatesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {candidates.map((candidate, index) => (
        <motion.div
          key={candidate.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <CandidateCard {...candidate} />
        </motion.div>
      ))}
    </div>
  );
}