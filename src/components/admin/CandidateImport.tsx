import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Papa from "papaparse";

interface CandidateImportProps {
  onConfirm: (candidates: any[]) => void;
}

interface ParsedCandidate {
  "Nom Complet": string;
  "Région": string;
  "Photo URL (Maillot)": string;
}

export function CandidateImport({ onConfirm }: CandidateImportProps) {
  const [parsedData, setParsedData] = useState<ParsedCandidate[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        setParsedData(results.data as ParsedCandidate[]);
        setIsPreviewMode(true);
        toast.success("File parsed successfully");
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const handleConfirm = () => {
    const formattedCandidates = parsedData.map((candidate, index) => ({
      id: (index + 1).toString(),
      name: candidate["Nom Complet"],
      region: candidate["Région"],
      image: candidate["Photo URL (Maillot)"],
      age: 20, // Default age since it's not in the CSV
      bio: "", // Empty bio since it's not in the CSV
      socialMedia: {} // Empty social media since it's not in the CSV
    }));

    onConfirm(formattedCandidates);
    setIsPreviewMode(false);
    setParsedData([]);
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
          <h3 className="text-lg font-semibold">Preview ({parsedData.length} candidates)</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {parsedData.map((candidate, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <img
                    src={candidate["Photo URL (Maillot)"]}
                    alt={candidate["Nom Complet"]}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <h4 className="font-medium">{candidate["Nom Complet"]}</h4>
                  <p className="text-sm text-muted-foreground">{candidate["Région"]}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}