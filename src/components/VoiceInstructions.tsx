import { useTranslation } from "@/hooks/useTranslation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VoiceInstructionsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const VoiceInstructions = ({
  value,
  onValueChange,
}: VoiceInstructionsProps) => {
  const t = useTranslation();

  return (
    <div className="space-y-3">
      <Label htmlFor="voice-instructions" className="text-sm font-medium text-foreground">
        {t.voiceInstructionsLabel}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          ({t.optional})
        </span>
      </Label>
      <Textarea
        id="voice-instructions"
        placeholder={t.voiceInstructionsPlaceholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="min-h-[100px] resize-y"
      />
      <p className="text-xs text-muted-foreground">
        {t.voiceInstructionsDescription}
      </p>
    </div>
  );
};
