import { useState, useEffect } from "react";
import { Settings, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const WEBHOOK_STORAGE_KEY = "mathbook_webhook_url";
const VOICES_STORAGE_KEY = "mathbook_voices";
const LANGUAGE_STORAGE_KEY = "mathbook_language";

// Get permanent webhook URL from environment variable
const PERMANENT_WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || "";

interface Voice {
  id: string;
  name: string;
}

export const SettingsDialog = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [newVoiceId, setNewVoiceId] = useState("");
  const [newVoiceName, setNewVoiceName] = useState("");
  const [language, setLanguage] = useState("en");
  const [open, setOpen] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    // Use permanent webhook URL if set, otherwise use saved one from localStorage
    const savedWebhook = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    const savedVoices = localStorage.getItem(VOICES_STORAGE_KEY);
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (PERMANENT_WEBHOOK_URL) {
      setWebhookUrl(PERMANENT_WEBHOOK_URL);
    } else if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
    if (savedVoices) setVoices(JSON.parse(savedVoices));
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error(t.webhookUrlError);
      return;
    }
    // Only save to localStorage if permanent webhook is not set
    if (!PERMANENT_WEBHOOK_URL) {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, webhookUrl);
      toast.success(t.webhookSaved);
    }
  };

  const handleAddVoice = () => {
    if (!newVoiceId.trim() || !newVoiceName.trim()) {
      toast.error(t.voiceAddError);
      return;
    }
    
    const updatedVoices = [...voices, { id: newVoiceId, name: newVoiceName }];
    setVoices(updatedVoices);
    localStorage.setItem(VOICES_STORAGE_KEY, JSON.stringify(updatedVoices));
    setNewVoiceId("");
    setNewVoiceName("");
    toast.success(t.voiceAdded);
  };

  const handleDeleteVoice = (id: string) => {
    const updatedVoices = voices.filter(v => v.id !== id);
    setVoices(updatedVoices);
    localStorage.setItem(VOICES_STORAGE_KEY, JSON.stringify(updatedVoices));
    toast.success(t.voiceRemoved);
  };

  const handleSaveLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    toast.success(t.languageSaved);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed left-6 bottom-6 h-12 w-12 rounded-full shadow-hover bg-card border-border hover:bg-accent z-50"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t.settings}</DialogTitle>
          <DialogDescription>
            {t.settingsDescription}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="webhook" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="webhook">{t.webhook}</TabsTrigger>
            <TabsTrigger value="voices">{t.voices}</TabsTrigger>
            <TabsTrigger value="language">{t.language}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t.webhookUrl}
              </label>
              <Input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={t.webhookPlaceholder}
                className="bg-background border-border"
                disabled={!!PERMANENT_WEBHOOK_URL}
              />
              {PERMANENT_WEBHOOK_URL && (
                <p className="text-xs text-primary font-medium">
                  Using permanent webhook URL (set via environment variable)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t.webhookDescription}
              </p>
            </div>
            {!PERMANENT_WEBHOOK_URL && (
              <div className="flex justify-end">
                <Button onClick={handleSaveWebhook} className="bg-gradient-primary hover:opacity-90">
                  {t.saveWebhook}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="voices" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={t.voiceIdPlaceholder}
                  value={newVoiceId}
                  onChange={(e) => setNewVoiceId(e.target.value)}
                  className="bg-background border-border"
                />
                <Input
                  placeholder={t.voiceNamePlaceholder}
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleAddVoice} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t.addVoice}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {voices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.noVoicesConfigured}
                </p>
              ) : (
                voices.map((voice) => (
                  <div
                    key={voice.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                  >
                    <div>
                      <p className="font-medium text-foreground">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">{voice.id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVoice(voice.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="language" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t.selectLanguage}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => handleSaveLanguage("en")}
                  className="w-full"
                >
                  {t.english}
                </Button>
                <Button
                  variant={language === "tr" ? "default" : "outline"}
                  onClick={() => handleSaveLanguage("tr")}
                  className="w-full"
                >
                  {t.turkish}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.languageDescription}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export const getWebhookUrl = () => {
  // Priority: 1. Permanent webhook from env, 2. User-saved webhook from localStorage
  return PERMANENT_WEBHOOK_URL || localStorage.getItem(WEBHOOK_STORAGE_KEY) || "";
};

export const getConfiguredVoices = (): Voice[] => {
  const saved = localStorage.getItem(VOICES_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const getLanguage = () => {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
};