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
import { supabase } from "@/lib/supabase";

interface VoiceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const VoiceSelector = ({ value, onValueChange }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const t = useTranslation();

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const { data, error } = await supabase
          .from("voices")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && Array.isArray(data)) {
          setVoices(data);
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
                value={voice.voice_id}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <p className="text-xs text-muted-foreground">{t.voiceDescription}</p>
    </div>
  );
};
