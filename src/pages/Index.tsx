import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-rich-black mb-6">
                Prédisez la Prochaine
                <br />
                <span className="text-gold">Miss France</span>
              </h1>
              <p className="text-lg md:text-xl text-rich-black/60 max-w-2xl mx-auto mb-8">
                Participez au concours de pronostics et tentez de prédire le Top 5
                des candidates Miss France 2024.
              </p>
              <Button size="lg" className="hover-lift">
                Découvrir les candidates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-8 rounded-lg text-center"
            >
              <h3 className="font-playfair text-2xl font-semibold mb-4">Faites vos pronostics</h3>
              <p className="text-rich-black/60">
                Sélectionnez et classez vos 5 candidates favorites pour le concours Miss France.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-8 rounded-lg text-center"
            >
              <h3 className="font-playfair text-2xl font-semibold mb-4">Gagnez des points</h3>
              <p className="text-rich-black/60">
                Accumulez des points en fonction de la précision de vos prédictions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card p-8 rounded-lg text-center lg:col-span-1 md:col-span-2 lg:col-span-1"
            >
              <h3 className="font-playfair text-2xl font-semibold mb-4">Défiez vos amis</h3>
              <p className="text-rich-black/60">
                Créez ou rejoignez une ligue privée pour compétitionner entre amis.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;