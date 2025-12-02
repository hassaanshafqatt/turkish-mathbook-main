import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getConfiguredVoices } from "./SettingsDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface Voice {
  id: string;
  name: string;
}

interface VoiceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const VoiceSelector = ({ value, onValueChange }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const t = useTranslation();

  useEffect(() => {
    const configuredVoices = getConfiguredVoices();
    setVoices(configuredVoices);
  }, []);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        {t.voiceLabel}
      </label>
      {voices.length === 0 ? (
        <div className="p-4 border border-border rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground text-center">
            {t.noVoicesInSelector}
          </p>
        </div>
      ) : (
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full bg-background border-border">
            <SelectValue placeholder={t.chooseVoice} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {voices.map((voice) => (
              <SelectItem
                key={voice.id}
                value={voice.id}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <p className="text-xs text-muted-foreground">
        {t.voiceDescription}
      </p>
    </div>
  );
};