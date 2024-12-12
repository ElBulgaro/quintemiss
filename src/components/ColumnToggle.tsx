import { LayoutGrid, Columns } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface ColumnToggleProps {
  singleColumn: boolean;
  onToggle: (value: boolean) => void;
}

export function ColumnToggle({ singleColumn, onToggle }: ColumnToggleProps) {
  return (
    <div className="flex gap-2">
      <Toggle
        pressed={singleColumn}
        onPressedChange={() => onToggle(true)}
        aria-label="Single column view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={!singleColumn}
        onPressedChange={() => onToggle(false)}
        aria-label="Double column view"
      >
        <Columns className="h-4 w-4" />
      </Toggle>
    </div>
  );
}