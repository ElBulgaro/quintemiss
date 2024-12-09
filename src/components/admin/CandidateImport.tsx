import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/data/candidates";

interface CandidateImportProps {
  onConfirm: (candidates: Candidate[]) => void;
}

interface ParsedCandidate {
  "Région": string;
  "Nom Complet": string;
  "Bio": string;
  "Age": string;
  "Instagram": string;
  "Photo URL (Costume)": string;
  "Photo URL (Maillot)": string;
  "URL Portrait TF1": string;
}

export function CandidateImport({ onConfirm }: CandidateImportProps) {
  const [parsedData, setParsedData] = useState<ParsedCandidate[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        setParsedData(results.data as ParsedCandidate[]);
        setIsPreviewMode(true);
        toast.success("Fichier analysé avec succès");
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // First check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .single();

      if (profileError) {
        throw new Error("Couldn't verify admin status");
      }

      if (!profile?.is_admin) {
        throw new Error("Only admins can import candidates");
      }

      // Format for database insertion
      const candidatesForDb = parsedData.map((candidate) => ({
        name: candidate["Nom Complet"],
        region: candidate["Région"],
        bio: candidate["Bio"],
        age: parseInt(candidate["Age"]),
        instagram: candidate["Instagram"],
        image_url: candidate["Photo URL (Maillot)"],
        official_photo_url: candidate["Photo URL (Costume)"],
        portrait_url: candidate["URL Portrait TF1"] || null,
      }));

      // Insert into Supabase
      const { data: insertedCandidates, error } = await supabase
        .from('candidates')
        .insert(candidatesForDb)
        .select();

      if (error) throw error;

      if (!insertedCandidates) {
        throw new Error("No candidates were returned after insertion");
      }

      toast.success("Candidates importés avec succès dans la base de données");
      onConfirm(insertedCandidates);
      setIsPreviewMode(false);
      setParsedData([]);
    } catch (error) {
      console.error('Error importing candidates:', error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'importation des candidates");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Upload CSV
        </label>
      </div>

      {isPreviewMode && parsedData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Aperçu ({parsedData.length} candidates)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {parsedData.map((candidate, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                    <img
                      src={candidate["Photo URL (Maillot)"]}
                      alt={candidate["Nom Complet"]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium">{candidate["Nom Complet"]}</h4>
                  <p className="text-sm text-muted-foreground">{candidate["Région"]}</p>
                  <p className="text-sm text-muted-foreground">{candidate["Age"]} ans</p>
                  {candidate["Instagram"] && (
                    <a 
                      href={`https://instagram.com/${candidate["Instagram"].replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {candidate["Instagram"]}
                    </a>
                  )}
                  <p className="text-sm line-clamp-3">{candidate["Bio"]}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Importation..." : "Confirmer l'import"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
