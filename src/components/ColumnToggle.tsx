import { Toggle } from "@/components/ui/toggle";

interface ColumnToggleProps {
  singleColumn: boolean;
  onToggle: (value: boolean) => void;
}

export function ColumnToggle({ singleColumn, onToggle }: ColumnToggleProps) {
  return (
    <div className="flex gap-2">
      <Toggle
        pressed={!singleColumn}
        onPressedChange={() => onToggle(false)}
        aria-label="Double column view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </Toggle>
      <Toggle
        pressed={singleColumn}
        onPressedChange={() => onToggle(true)}
        aria-label="Single column view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="5" height="10" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="3" width="5" height="10" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </Toggle>
    </div>
  );
}