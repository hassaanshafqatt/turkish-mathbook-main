import { useTranslation } from "@/hooks/useTranslation";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BackgroundColorSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const colorOptions = [
  { name: "white", hex: "#FFFFFF", label: "White" },
  { name: "light-blue", hex: "#E3F2FD", label: "Light Blue" },
  { name: "light-yellow", hex: "#FFF9C4", label: "Light Yellow" },
  { name: "gray", hex: "#F5F5F5", label: "Gray" },
];

export const BackgroundColorSelector = ({
  value,
  onValueChange,
}: BackgroundColorSelectorProps) => {
  const t = useTranslation();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">
        {t.backgroundColorLabel}
      </Label>
      <div className="flex items-center gap-4">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onValueChange(color.name)}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "group relative flex flex-col items-center gap-2 transition-all duration-200",
              "hover:scale-110 focus:outline-none focus-visible:outline-none",
            )}
            aria-label={`${t.selectColor} ${color.label}`}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full border-4 transition-all duration-200 shadow-md",
                "group-hover:shadow-lg",
                value === color.name
                  ? "border-primary shadow-lg ring-4 ring-primary/20"
                  : "border-border group-hover:border-primary/50",
              )}
              style={{ backgroundColor: color.hex }}
            />
            <span
              className={cn(
                "text-xs font-medium transition-colors duration-200",
                value === color.name
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {t[`color_${color.name.replace("-", "_")}`] || color.label}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {t.backgroundColorDescription}
      </p>
    </div>
  );
};
