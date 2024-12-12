import { useState } from "react";
import { motion } from "framer-motion";
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
  onClick?: () => void;  // Added onClick prop
}

export function CandidateCard({ 
  id,
  name, 
  age, 
  region, 
  image_url, 
  bio, 
  official_photo_url,
  portrait_url,
  instagram,
  selected,
  onClick 
}: CandidateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card rounded-lg overflow-hidden ${
        selected ? "ring-2 ring-gold" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CandidateImage
        name={name}
        imageUrl={image_url}
        officialPhotoUrl={official_photo_url}
        isHovered={isHovered}
        selected={selected}
        onClick={onClick}  // Pass onClick to CandidateImage
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-rich-black">{name}</h3>
            <span className="text-sm text-rich-black/60">{age} ans • {region}</span>
          </div>
          <CandidateSocialLinks
            instagram={instagram}
            portrait_url={portrait_url}
          />
        </div>
        <p className="text-sm text-rich-black/80 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">{bio}</p>
      </div>
    </motion.div>
  );
}