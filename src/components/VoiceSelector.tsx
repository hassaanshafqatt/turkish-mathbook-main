import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Voice } from "./SettingsDialog";

interface VoiceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const API_URL = import.meta.env.DEV ? 'http://localhost:7893/api/settings' : '/api/settings';

export const VoiceSelector = ({ value, onValueChange }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const t = useTranslation();

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.voices && Array.isArray(data.voices)) {
            setVoices(data.voices);
          }
        }
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      }
    };

    fetchVoices();
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