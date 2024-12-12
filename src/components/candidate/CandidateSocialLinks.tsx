import { Instagram, Tv } from "lucide-react";

interface CandidateSocialLinksProps {
  instagram?: string;
  portrait_url?: string;
}

export function CandidateSocialLinks({ instagram, portrait_url }: CandidateSocialLinksProps) {
  return (
    <div className="flex items-center gap-4">
      {portrait_url && (
        <a
          href={portrait_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-rich-black/60 hover:text-rich-black transition-colors group"
          title="Voir le portrait TF1"
        >
          <Tv className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="hidden sm:inline">Portrait Vidéo</span>
        </a>
      )}
      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm group"
        >
          <Instagram className="h-4 w-4 text-rich-black/60 group-hover:text-[#E4405F] transition-colors" />
          <span>
            <span className="text-rich-black/40">@</span>
            <span className="text-rich-black/80 group-hover:text-rich-black transition-colors">
              {instagram.replace('@', '')}
            </span>
          </span>
        </a>
      )}
    </div>
  );
}