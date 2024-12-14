import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  selectedCandidates: string[];
}

export function ShareButton({ selectedCandidates }: ShareButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const { data: candidates = [] } = useQuery({
    queryKey: ['sheet-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sheet_candidates')
        .select('*')
        .order('region');
      
      if (error) throw error;
      return data;
    },
  });

  const generateShareText = () => {
    if (selectedCandidates.length !== 5) return "";

    const positions = selectedCandidates.map((id, index) => {
      const candidate = candidates.find(c => c.id === id);
      if (!candidate) return "";
      
      const position = index === 0 
        ? "👑 Miss France 2025"
        : index === 1 
          ? "2️⃣ 1ere Dauphine"
          : index === 2 
            ? "3️⃣ 2eme Dauphine"
            : index === 3 
              ? "4️⃣ 3eme Dauphine"
              : "5️⃣ 4eme Dauphine";
      
      return `${position} - ${candidate.region}`;
    });

    return `Voici mon TOP 5 pour Miss France 2025 !\n\n${positions.join("\n")}\n\nFaites vos pronostics sur https://quintemiss.lovable.app/ !`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (!text) {
      toast.error("Veuillez sélectionner 5 candidates pour partager");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          text,
          url: "https://quintemiss.lovable.app/",
        });
        toast.success("Partagé avec succès !");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setShowDialog(true);
        }
      }
    } else {
      setShowDialog(true);
    }
  };

  const handleCopy = async () => {
    const text = generateShareText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié dans le presse-papier !");
      setShowDialog(false);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handlePlatformShare = (platform: string) => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent("https://quintemiss.lovable.app/");
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "messenger":
        shareUrl = `https://www.facebook.com/dialog/send?link=${url}&app_id=123456789&redirect_uri=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Partager mon Top 5
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handlePlatformShare("facebook")}>
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlatformShare("twitter")}>
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlatformShare("linkedin")}>
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlatformShare("messenger")}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Messenger
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copier le lien
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager mon Top 5</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{generateShareText()}</p>
            <Button onClick={handleCopy} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copier le texte
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}