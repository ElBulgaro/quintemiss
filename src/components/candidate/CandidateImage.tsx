import { useState } from "react";
import { Shirt, UserRound } from "lucide-react";
import { Button } from "../ui/button";

interface CandidateImageProps {
  name: string;
  image_url: string;
  official_photo_url?: string;
  isHovered: boolean;
  selected?: boolean;
}

export function CandidateImage({ 
  name, 
  image_url, 
  official_photo_url,
  isHovered,
  selected 
}: CandidateImageProps) {
  const [showOfficialPhoto, setShowOfficialPhoto] = useState(true);
  const displayImage = showOfficialPhoto && official_photo_url ? official_photo_url : image_url;

  return (
    <div className="relative aspect-[3/4] overflow-hidden">
      <img
        src={displayImage}
        alt={name}
        className="w-full h-full object-cover object-top transition-transform duration-300"
        style={{
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-playfair text-xl font-semibold">{name}</h3>
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
            <Shirt className="h-4 w-4 text-white" />
          ) : (
            <UserRound className="h-4 w-4 text-white" />
          )}
        </Button>
      )}
    </div>
  );
}