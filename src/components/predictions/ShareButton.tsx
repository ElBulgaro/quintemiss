import { Share2, Twitter, Copy, Image, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { CollageCanvas } from "./CollageCanvas";

interface ShareButtonProps {
  selectedCandidates: string[];
}

export function ShareButton({ selectedCandidates }: ShareButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showCollageDialog, setShowCollageDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const collageRef = useRef<HTMLDivElement>(null);

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

  const selectedCandidateData = selectedCandidates
    .map(id => candidates.find(c => c.id === id))
    .filter(Boolean) as typeof candidates;

  const generateShareText = () => {
    if (selectedCandidates.length !== 5) return "";

    const positions = selectedCandidates.map((id, index) => {
      const candidate = candidates.find(c => c.id === id);
      if (!candidate) return "";
      
      const position = index === 0 
        ? "👑 Miss France 2026"
        : index === 1 
          ? "2️⃣ 1ere Dauphine"
          : index === 2 
            ? "3️⃣ 2eme Dauphine"
            : index === 3 
              ? "4️⃣ 3eme Dauphine"
              : "5️⃣ 4eme Dauphine";
      
      return `${position} - ${candidate.region}`;
    });

    return `Voici mon TOP 5 pour Miss France 2026 !\n\n${positions.join("\n")}\n\nFaites vos pronostics sur https://quintemiss.lovable.app/ !`;
  };

  const generateCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!collageRef.current) return null;
    
    try {
      const canvas = await html2canvas(collageRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null,
      });
      return canvas;
    } catch (error) {
      console.error("Error generating canvas:", error);
      return null;
    }
  }, []);

  const handleCopyImage = async () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner 5 candidates");
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Failed to generate image");

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Erreur lors de la génération");
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          toast.success("Image copiée dans le presse-papier !");
          setShowCollageDialog(false);
        } catch (error) {
          // Fallback: download instead
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "mon-top5-missfrande2026.png";
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Image téléchargée !");
          setShowCollageDialog(false);
        }
      }, "image/png");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération de l'image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner 5 candidates");
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Failed to generate image");

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "mon-top5-missfrance2026.png";
      a.click();
      toast.success("Image téléchargée !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareImage = async () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner 5 candidates");
      return;
    }

    if (!navigator.share || !navigator.canShare) {
      setShowCollageDialog(true);
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Failed to generate image");

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Erreur lors de la génération");
          return;
        }

        const file = new File([blob], "mon-top5-missfrance2026.png", { type: "image/png" });
        
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Mon Top 5 Miss France 2026",
              text: "Voici mon Top 5 pour Miss France 2026 !",
            });
            toast.success("Partagé avec succès !");
          } catch (error) {
            if ((error as Error).name !== "AbortError") {
              setShowCollageDialog(true);
            }
          }
        } else {
          setShowCollageDialog(true);
        }
      }, "image/png");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du partage");
    } finally {
      setIsGenerating(false);
    }
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
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const openCollageDialog = () => {
    if (selectedCandidates.length !== 5) {
      toast.error("Veuillez sélectionner 5 candidates");
      return;
    }
    setShowCollageDialog(true);
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
          <DropdownMenuItem onClick={openCollageDialog}>
            <Image className="mr-2 h-4 w-4" />
            Créer une image
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handlePlatformShare("twitter")}>
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlatformShare("whatsapp")}>
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager le texte...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copier le texte
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Share Dialog */}
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

      {/* Collage Dialog */}
      <Dialog open={showCollageDialog} onOpenChange={setShowCollageDialog}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mon Top 5 - Image</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {/* Collage Preview - Hidden for capture, visible preview shown below */}
            <div className="absolute -left-[9999px]">
              <CollageCanvas ref={collageRef} candidates={selectedCandidateData} />
            </div>
            
            {/* Visible Preview */}
            <div className="overflow-hidden rounded-lg shadow-lg border max-w-[320px]">
              <div className="w-[270px] h-[337px] bg-gradient-to-br from-rose-900 via-pink-800 to-amber-700 p-3 flex flex-col">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-bold text-white">Mon Top 5</h2>
                  <p className="text-amber-200 text-xs">Miss France 2026</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  {selectedCandidateData.slice(0, 1).map((c) => (
                    <div key={c.id} className="w-16 h-20 rounded overflow-hidden border-2 border-amber-300">
                      <img src={c.image_url || "/placeholder.svg"} alt={c.region} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    {selectedCandidateData.slice(1, 3).map((c) => (
                      <div key={c.id} className="w-12 h-16 rounded overflow-hidden border border-white/60">
                        <img src={c.image_url || "/placeholder.svg"} alt={c.region} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {selectedCandidateData.slice(3, 5).map((c) => (
                      <div key={c.id} className="w-10 h-14 rounded overflow-hidden border border-white/40">
                        <img src={c.image_url || "/placeholder.svg"} alt={c.region} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-white/60 text-[8px] text-center">quintemiss.lovable.app</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={handleCopyImage} disabled={isGenerating} className="gap-2">
                <Copy className="h-4 w-4" />
                {isGenerating ? "Génération..." : "Copier l'image"}
              </Button>
              <Button onClick={handleDownloadImage} disabled={isGenerating} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
              <Button onClick={handleShareImage} disabled={isGenerating} variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
