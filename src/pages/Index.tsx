import { motion } from "framer-motion";
import { CandidatesGrid } from "@/components/CandidatesGrid";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-rich-black mb-6">
              Miss France 2024
              <br />
              <span className="text-gold">Les Candidates</span>
            </h1>
            <p className="text-lg md:text-xl text-rich-black/60 max-w-2xl mx-auto">
              Découvrez les candidates au titre de Miss France 2024 et faites vos pronostics
              pour le Top 5.
            </p>
          </motion.div>

          <CandidatesGrid />
        </div>
      </main>
    </div>
  );
};

export default Index;