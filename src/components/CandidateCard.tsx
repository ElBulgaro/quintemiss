import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CandidateImage } from "./candidate/CandidateImage";
import { CandidateSocialLinks } from "./candidate/CandidateSocialLinks";

interface CandidateCardProps {
  id: string;
  name: string;
  age: number;
  region: string;
  image_url: string;
  bio: string;
  official_photo_url?: string;
  portrait_url?: string;
  instagram?: string;
  selected?: boolean;
}

export function CandidateCard({ 
  name, 
  age, 
  region, 
  image_url, 
  bio, 
  official_photo_url,
  portrait_url,
  instagram,
  selected 
}: CandidateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card rounded-lg overflow-hidden hover-lift relative ${
        selected ? "ring-2 ring-gold" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CandidateImage
        name={name}
        image_url={image_url}
        official_photo_url={official_photo_url}
        isHovered={isHovered}
        selected={selected}
      />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-rich-black/60">{age} ans</span>
          <CandidateSocialLinks
            instagram={instagram}
            portrait_url={portrait_url}
          />
        </div>
        <p className="text-sm text-rich-black/80 line-clamp-3">{bio}</p>
      </div>
    </motion.div>
  );
}