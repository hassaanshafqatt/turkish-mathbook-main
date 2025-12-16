import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { FontSelector } from "./FontSelector";
import { VoiceSelector } from "./VoiceSelector";
import { BackgroundColorSelector } from "./BackgroundColorSelector";
import { VoiceInstructions } from "./VoiceInstructions";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.DEV
  ? "http://localhost:7893/api/settings"
  : "/api/settings";

export const ProcessingForm = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [googleFont, setGoogleFont] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [voiceInstructions, setVoiceInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Toggles
  const [showHandAnimation, setShowHandAnimation] = useState(true);
  const [showOptionsAnimation, setShowOptionsAnimation] = useState(true);

  const t = useTranslation();

  const getActiveWebhook = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) return null;
      const data = await response.json();
      const active = data.webhooks?.find(
        (w: { active: boolean; url: string }) => w.active,
      );
      return active ? active.url : null;
    } catch (e) {
      console.error("Error fetching settings:", e);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      toast.error(t.uploadPdfError);
      return;
    }

    if (!googleFont.trim()) {
      toast.error(t.selectFontError);
      return;
    }

    if (!voiceId) {
      toast.error(t.selectVoiceError);
      return;
    }

    setIsSubmitting(true);

    // Fetch active webhook url just before submitting
    const webhookUrl = await getActiveWebhook();

    if (!webhookUrl) {
      toast.error(t.configureWebhookError);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("googleFont", googleFont);
      formData.append("voiceId", voiceId);
      formData.append("backgroundColor", backgroundColor);
      if (voiceInstructions.trim()) {
        formData.append("voiceInstructions", voiceInstructions);
      }
      // Append new toggle values
      formData.append("showHandAnimation", showHandAnimation.toString());
      formData.append("showOptionsAnimation", showOptionsAnimation.toString());

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Webhook request failed");
      }

      toast.success(t.submitSuccess);

      // Reset form
      setPdfFile(null);
      setGoogleFont("");
      setVoiceId("");
      setBackgroundColor("white");
      setVoiceInstructions("");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <FileUpload onFileSelect={setPdfFile} selectedFile={pdfFile} />

      <FontSelector value={googleFont} onValueChange={setGoogleFont} />

      <VoiceSelector value={voiceId} onValueChange={setVoiceId} />

      <BackgroundColorSelector
        value={backgroundColor}
        onValueChange={setBackgroundColor}
      />

      <VoiceInstructions
        value={voiceInstructions}
        onValueChange={setVoiceInstructions}
      />

      {/* Animation Toggles */}
      <div className="space-y-4 border p-4 rounded-lg bg-card/50">
        <h3 className="font-medium text-sm text-foreground mb-2">
          {t.animationSettings}
        </h3>

        <div className="flex items-center justify-between space-x-2">
          <Label
            htmlFor="hand-animation"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span>{t.showHandAnimation}</span>
            <span className="font-normal text-xs text-muted-foreground">
              {t.showHandAnimationDesc}
            </span>
          </Label>
          <Switch
            id="hand-animation"
            checked={showHandAnimation}
            onCheckedChange={setShowHandAnimation}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label
            htmlFor="options-animation"
            className="flex flex-col space-y-1 cursor-pointer"
          >
            <span>{t.showOptionsAnimation}</span>
            <span className="font-normal text-xs text-muted-foreground">
              {t.showOptionsAnimationDesc}
            </span>
          </Label>
          <Switch
            id="options-animation"
            checked={showOptionsAnimation}
            onCheckedChange={setShowOptionsAnimation}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t.generating}
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {t.generateButton}
          </>
        )}
      </Button>
    </form>
  );
};
