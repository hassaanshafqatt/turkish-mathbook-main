import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { FontSelector } from "./FontSelector";
import { VoiceSelector } from "./VoiceSelector";
import { BackgroundColorSelector } from "./BackgroundColorSelector";
import { VoiceInstructions } from "./VoiceInstructions";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";

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
  const [mathMode, setMathMode] = useState(false);

  const t = useTranslation();
  const { user } = useAuth();

  const getActiveWebhook = async () => {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("url")
        .eq("active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching active webhook:", error);
        return null;
      }

      return data?.url || null;
    } catch (e) {
      console.error("Error fetching webhook:", e);
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
      // Append user email
      if (user?.email) {
        formData.append("email", user.email);
      }
      // Append new toggle values
      formData.append("showHandAnimation", showHandAnimation.toString());
      formData.append("showOptionsAnimation", showOptionsAnimation.toString());
      formData.append("mathMode", mathMode.toString());

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
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <FileUpload onFileSelect={setPdfFile} selectedFile={pdfFile} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipUploadPdf}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <FontSelector value={googleFont} onValueChange={setGoogleFont} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipFont}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <VoiceSelector value={voiceId} onValueChange={setVoiceId} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipVoice}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <BackgroundColorSelector
                value={backgroundColor}
                onValueChange={setBackgroundColor}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipBackgroundColor}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <VoiceInstructions
                value={voiceInstructions}
                onValueChange={setVoiceInstructions}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipVoiceInstructions}</p>
          </TooltipContent>
        </Tooltip>

        {/* Animation Toggles */}
        <div className="space-y-4 border p-4 rounded-lg bg-card/50">
          <h3 className="font-medium text-sm text-foreground mb-2">
            {t.animationSettings}
          </h3>

          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltipHandAnimation}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltipOptionsAnimation}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="math-mode"
                  className="flex flex-col space-y-1 cursor-pointer"
                >
                  <span>{t.mathMode}</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    {t.mathModeDesc}
                  </span>
                </Label>
                <Switch
                  id="math-mode"
                  checked={mathMode}
                  onCheckedChange={setMathMode}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltipMathMode}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipGenerate}</p>
          </TooltipContent>
        </Tooltip>
      </form>
    </TooltipProvider>
  );
};
