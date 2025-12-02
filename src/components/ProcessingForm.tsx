import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { FontSelector } from "./FontSelector";
import { VoiceSelector } from "./VoiceSelector";
import { getWebhookUrl } from "./SettingsDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export const ProcessingForm = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [googleFont, setGoogleFont] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslation();

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

    const webhookUrl = getWebhookUrl();
    if (!webhookUrl.trim()) {
      toast.error(t.configureWebhookError);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("googleFont", googleFont);
      formData.append("voiceId", voiceId);

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
