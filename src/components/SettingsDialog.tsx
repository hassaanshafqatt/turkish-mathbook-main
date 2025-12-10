import { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Check } from "lucide-react";
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
import { Label } from "@/components/ui/label";

// Types matching the server backend
export interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface Voice {
  id: string;
  name: string;
}

export interface AppSettings {
  webhooks: Webhook[];
  voices: Voice[];
  language: string;
}

const API_URL = import.meta.env.DEV ? 'http://localhost:7893/api/settings' : '/api/settings';

export const SettingsDialog = () => {
  const [settings, setSettings] = useState<AppSettings>({
    webhooks: [],
    voices: [],
    language: 'en'
  });

  // Webhook form state
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // Voice form state
  const [newVoiceId, setNewVoiceId] = useState("");
  const [newVoiceName, setNewVoiceName] = useState("");

  const [open, setOpen] = useState(false);
  const t = useTranslation();

  // Load settings from API
  const fetchSettings = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        // Sync language to local storage for immediate UI translation updates if needed,
        // though ideally we'd use the settings state context.
        // For compatibility with useTranslation hook:
        if (data.language) localStorage.setItem('mathbook_language', data.language);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    }
  };

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) throw new Error("Failed to save");

      setSettings(newSettings);

      // Update local storage for language
      if (newSettings.language !== settings.language) {
        localStorage.setItem('mathbook_language', newSettings.language);
        window.location.reload();
      }

      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
      return false;
    }
  };

  // Webhook handlers
  const handleAddWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      toast.error(t.webhookUrlError || "Please enter both name and URL");
      return;
    }

    const newWebhook: Webhook = {
      id: crypto.randomUUID(),
      name: newWebhookName,
      url: newWebhookUrl,
      active: settings.webhooks.length === 0 // Make active if it's the first one
    };

    const updatedSettings = {
      ...settings,
      webhooks: [...settings.webhooks, newWebhook]
    };

    if (await saveSettings(updatedSettings)) {
      setNewWebhookName("");
      setNewWebhookUrl("");
      toast.success(t.webhookSaved);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    const updatedSettings = {
      ...settings,
      webhooks: settings.webhooks.filter(w => w.id !== id)
    };
    if (await saveSettings(updatedSettings)) {
      toast.success("Webhook removed");
    }
  };

  const handleSetActiveWebhook = async (id: string) => {
    const updatedSettings = {
      ...settings,
      webhooks: settings.webhooks.map(w => ({
        ...w,
        active: w.id === id
      }))
    };
    if (await saveSettings(updatedSettings)) {
      toast.success("Active webhook updated");
    }
  };

  // Voice handlers
  const handleAddVoice = async () => {
    if (!newVoiceId.trim() || !newVoiceName.trim()) {
      toast.error(t.voiceAddError);
      return;
    }

    const updatedSettings = {
      ...settings,
      voices: [...settings.voices, { id: newVoiceId, name: newVoiceName }]
    };

    if (await saveSettings(updatedSettings)) {
      setNewVoiceId("");
      setNewVoiceName("");
      toast.success(t.voiceAdded);
    }
  };

  const handleDeleteVoice = async (id: string) => {
    const updatedSettings = {
      ...settings,
      voices: settings.voices.filter(v => v.id !== id)
    };
    if (await saveSettings(updatedSettings)) {
      toast.success(t.voiceRemoved);
    }
  };

  // Language handler
  const handleSaveLanguage = async (lang: string) => {
    const updatedSettings = { ...settings, language: lang };
    if (await saveSettings(updatedSettings)) {
      toast.success(t.languageSaved);
    }
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
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.settings}</DialogTitle>
          <DialogDescription>
            {t.settingsDescription}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="webhook" className="w-full flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="webhook">{t.webhook}</TabsTrigger>
            <TabsTrigger value="voices">{t.voices}</TabsTrigger>
            <TabsTrigger value="language">{t.language}</TabsTrigger>
          </TabsList>

          <TabsContent value="webhook" className="space-y-4 flex-1 overflow-y-auto p-1">
            <div className="space-y-4">
              {/* Add New Webhook */}
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Add New Webhook</p>
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    placeholder="Webhook Name (e.g. Production)"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                    className="bg-background"
                  />
                  <Input
                    type="url"
                    placeholder="Webhook URL (https://...)"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button onClick={handleAddWebhook} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </div>

              {/* List Webhooks */}
              <div className="space-y-2">
                <Label>Saved Webhooks</Label>
                {settings.webhooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No webhooks configured</p>
                ) : (
                  settings.webhooks.map((webhook) => (
                    <div key={webhook.id} className={`flex items-center justify-between p-3 rounded-lg border ${webhook.active ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{webhook.name}</p>
                          {webhook.active && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={webhook.url}>{webhook.url}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!webhook.active && (
                          <Button size="sm" variant="ghost" onClick={() => handleSetActiveWebhook(webhook.id)} title="Set Active">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteWebhook(webhook.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voices" className="space-y-4 flex-1 overflow-y-auto p-1">
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

            <div className="space-y-2">
              {settings.voices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.noVoicesConfigured}
                </p>
              ) : (
                settings.voices.map((voice) => (
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

          <TabsContent value="language" className="space-y-4 flex-1 overflow-y-auto p-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t.selectLanguage}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={settings.language === "en" ? "default" : "outline"}
                  onClick={() => handleSaveLanguage("en")}
                  className="w-full"
                >
                  {t.english}
                </Button>
                <Button
                  variant={settings.language === "tr" ? "default" : "outline"}
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