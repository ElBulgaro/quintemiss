import { useImageToggleStore } from "@/store/useImageToggleStore";
import { UserRound, Check } from "lucide-react";

interface CandidateImageProps {
  imageUrl?: string;
  officialPhotoUrl?: string;
  name: string;
  selected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export function CandidateImage({ 
  imageUrl, 
  officialPhotoUrl, 
  name, 
  selected, 
  isHovered,
  onClick 
}: CandidateImageProps) {
  const { showOfficialPhoto } = useImageToggleStore();
  const displayUrl = showOfficialPhoto ? officialPhotoUrl : imageUrl;

  if (!displayUrl) {
    return (
      <div className="relative w-full pb-[133%] bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <UserRound className="w-12 h-12 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full pb-[133%] rounded-lg overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0">
        <img
          src={displayUrl}
          alt={name}
          className="absolute w-[120%] h-[120%] object-cover object-top left-1/2 -translate-x-1/2"
        />
      </div>
      {selected && (
        <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
          <Check className="w-12 h-12 text-gold" />
        </div>
      )}
    </div>
  );
}