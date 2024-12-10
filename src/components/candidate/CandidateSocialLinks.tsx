import { Instagram, Tv } from "lucide-react";

interface CandidateSocialLinksProps {
  instagram?: string;
  portrait_url?: string;
}

export function CandidateSocialLinks({ instagram, portrait_url }: CandidateSocialLinksProps) {
  return (
    <div className="flex items-center gap-2">
      {portrait_url && (
        <a
          href={portrait_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-rich-black/60 hover:text-rich-black transition-colors"
          title="Voir le portrait TF1"
        >
          <Tv className="h-4 w-4" />
        </a>
      )}
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
  );
}