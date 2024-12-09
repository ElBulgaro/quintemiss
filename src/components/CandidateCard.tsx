import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Image as ImageIcon, UserRound, Instagram } from "lucide-react";
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
}

export function CandidateCard({ 
  name, 
  age, 
  region, 
  image_url, 
  bio, 
  official_photo_url,
  instagram,
  selected 
}: CandidateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOfficialPhoto, setShowOfficialPhoto] = useState(true);

  const displayImage = showOfficialPhoto && official_photo_url ? official_photo_url : image_url;

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
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={displayImage}
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
        {selected && (
          <div className="absolute top-2 right-2 bg-gold rounded-full p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
        {official_photo_url && (
          <Button
            onClick={() => setShowOfficialPhoto(!showOfficialPhoto)}
            size="icon"
            variant="ghost"
            className="absolute top-2 left-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            title={showOfficialPhoto ? "Voir la photo en maillot de bain" : "Voir la photo officielle"}
          >
            {showOfficialPhoto ? (
              <ImageIcon className="h-4 w-4 text-white" />
            ) : (
              <UserRound className="h-4 w-4 text-white" />
            )}
          </Button>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-rich-black/60">{age} ans</span>
          {instagram && (
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-rich-black/60 hover:text-rich-black transition-colors"
            >
              <Instagram className="h-4 w-4" />
              <span>{instagram}</span>
            </a>
          )}
        </div>
        <p className="text-sm text-rich-black/80 line-clamp-3">{bio}</p>
      </div>
    </motion.div>
  );
}