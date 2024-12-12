import { useState } from "react";
import { motion } from "framer-motion";
import { CandidateImage } from "./candidate/CandidateImage";
import { CandidateSocialLinks } from "./candidate/CandidateSocialLinks";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

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
  onClick?: () => void;
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card rounded-lg overflow-hidden flex flex-col ${
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
        onClick={onClick}
      />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-rich-black/60 uppercase tracking-wider">{region}</p>
          <h3 className="font-medium text-rich-black">{name} - {age} ans</h3>
          <CandidateSocialLinks
            instagram={instagram}
            portrait_url={portrait_url}
          />
        </div>
        {bio && (
          <div className="space-y-2">
            <p className={`text-sm text-rich-black/80 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
              {bio}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-rich-black/60 hover:text-rich-black flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Voir moins
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Lire la suite
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}