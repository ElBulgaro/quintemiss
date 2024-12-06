import { useState } from "react";
import { motion } from "framer-motion";

interface CandidateCardProps {
  id: string;
  name: string;
  age: number;
  region: string;
  image: string;
  bio: string;
}

export function CandidateCard({ name, age, region, image, bio }: CandidateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-lg overflow-hidden hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-playfair text-xl font-semibold">{name}</h3>
          <p className="text-sm opacity-90">{region}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-rich-black/60">{age} ans</span>
          <div className="h-1 w-1 rounded-full bg-gold" />
        </div>
        <p className="text-sm text-rich-black/80 line-clamp-3">{bio}</p>
      </div>
    </motion.div>
  );
}