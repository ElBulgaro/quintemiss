import { LayoutGrid, Grid3X3, List } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

type ViewMode = 'grid-2' | 'grid-3' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2">
      <Toggle
        pressed={viewMode === 'grid-2'}
        onPressedChange={() => onViewChange('grid-2')}
        aria-label="2-column grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={viewMode === 'grid-3'}
        onPressedChange={() => onViewChange('grid-3')}
        aria-label="3-column grid view"
      >
        <Grid3X3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={viewMode === 'list'}
        onPressedChange={() => onViewChange('list')}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Toggle>
    </div>
  );
}