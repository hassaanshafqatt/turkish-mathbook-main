import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/hooks/useTranslation";

interface FontSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

interface GoogleFont {
  family: string;
  variants: string[];
}

export const FontSelector = ({ value, onValueChange }: FontSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();

  // Load the selected Google Font so we can show a live preview
  useEffect(() => {
    if (!value) return;

    const id = `google-font-preview-${value.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    // Basic Google Fonts CSS2 URL for the family
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      value
    )}:wght@400;600&display=swap`;

    document.head.appendChild(link);

    return () => {
      // We intentionally do not remove the link tag on unmount/value change
      // so that once loaded fonts stay cached and available while the app is open.
    };
  }, [value]);

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        // Using Google Fonts API - you can add your API key if needed
        const response = await fetch(
          "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDxp_prbncAMTzTuMR5kgWBC_c4P5k5rx0"
        );
        const data = await response.json();
        setFonts(data.items || []);
      } catch (error) {
        console.error("Error fetching fonts:", error);
        // Fallback to popular fonts if API fails
        setFonts([
          { family: "Inter", variants: [] },
          { family: "Roboto", variants: [] },
          { family: "Open Sans", variants: [] },
          { family: "Lato", variants: [] },
          { family: "Montserrat", variants: [] },
          { family: "Poppins", variants: [] },
          { family: "Merriweather", variants: [] },
          { family: "Playfair Display", variants: [] },
          { family: "Source Sans Pro", variants: [] },
          { family: "Raleway", variants: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFonts();
  }, []);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        {t.fontLabel}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background border-border"
          >
            {value ? (
              <span className="flex items-center">
                <Type className="w-4 h-4 mr-2" />
                {value}
              </span>
            ) : (
              <span className="text-muted-foreground">{t.fontLabel}...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={t.searchFonts} className="h-9" />
            <CommandList>
              <CommandEmpty>
                {loading ? t.loadingFonts : t.noFontsFound}
              </CommandEmpty>
              <CommandGroup>
                {fonts.map((font) => (
                  <CommandItem
                    key={font.family}
                    value={font.family}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {font.family}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === font.family ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Font preview ({value})
          </p>
          <p
            className="text-base leading-relaxed text-foreground"
            style={{ fontFamily: `'${value}', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` }}
          >
            The quick brown fox jumps over the lazy dog — 0123456789
          </p>
        </div>
      )}
    </div>
  );
};
