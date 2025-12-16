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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// Types
export interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  created_by?: string;
  created_at?: string;
}

export interface Voice {
  id: string;
  voice_id: string;
  name: string;
  created_by?: string;
  created_at?: string;
}

export interface UserPreferences {
  user_id: string;
  language: string;
}

export const SettingsDialog = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [language, setLanguage] = useState<string>("en");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Webhook form state
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // Voice form state
  const [newVoiceId, setNewVoiceId] = useState("");
  const [newVoiceName, setNewVoiceName] = useState("");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslation();
  const { user } = useAuth();

  const isAdminOrOwner = userRole === "admin" || userRole === "owner";

  // Fetch user role
  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || "user");
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  // Fetch webhooks (admin/owner only)
  const fetchWebhooks = async () => {
    if (!isAdminOrOwner) return;

    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      toast.error("Failed to load webhooks");
    }
  };

  // Fetch voices (all users can read)
  const fetchVoices = async () => {
    try {
      const { data, error } = await supabase
        .from("voices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoices(data || []);
    } catch (error) {
      console.error("Error fetching voices:", error);
      toast.error("Failed to load voices");
    }
  };

  // Fetch user preferences
  const fetchUserPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setLanguage(data.language);
        localStorage.setItem("qlyra_language", data.language);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  // Load all data when dialog opens
  useEffect(() => {
    if (open && user) {
      setLoading(true);
      Promise.all([
        fetchUserRole(),
        fetchVoices(),
        fetchUserPreferences(),
      ]).finally(() => setLoading(false));
    }
  }, [open, user]);

  // Fetch webhooks after role is loaded
  useEffect(() => {
    if (open && isAdminOrOwner) {
      fetchWebhooks();
    }
  }, [open, isAdminOrOwner]);

  // Webhook handlers
  const handleAddWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      toast.error(t.webhookUrlError || "Please enter both name and URL");
      return;
    }

    if (!isAdminOrOwner) {
      toast.error("Only admins and owners can manage webhooks");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("webhooks")
        .insert({
          name: newWebhookName,
          url: newWebhookUrl,
          active: webhooks.length === 0, // First webhook is active by default
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks([data, ...webhooks]);
      setNewWebhookName("");
      setNewWebhookUrl("");
      toast.success(t.webhookSaved);
    } catch (error) {
      console.error("Error adding webhook:", error);
      toast.error("Failed to add webhook");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!isAdminOrOwner) {
      toast.error("Only admins and owners can manage webhooks");
      return;
    }

    try {
      const { error } = await supabase.from("webhooks").delete().eq("id", id);

      if (error) throw error;

      setWebhooks(webhooks.filter((w) => w.id !== id));
      toast.success("Webhook removed");
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Failed to delete webhook");
    }
  };

  const handleSetActiveWebhook = async (id: string) => {
    if (!isAdminOrOwner) {
      toast.error("Only admins and owners can manage webhooks");
      return;
    }

    try {
      // The database trigger will handle deactivating other webhooks
      const { error } = await supabase
        .from("webhooks")
        .update({ active: true })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setWebhooks(
        webhooks.map((w) => ({
          ...w,
          active: w.id === id,
        })),
      );
      toast.success("Active webhook updated");
    } catch (error) {
      console.error("Error setting active webhook:", error);
      toast.error("Failed to update active webhook");
    }
  };

  // Voice handlers
  const handleAddVoice = async () => {
    if (!newVoiceId.trim() || !newVoiceName.trim()) {
      toast.error(t.voiceAddError);
      return;
    }

    if (!isAdminOrOwner) {
      toast.error("Only admins and owners can manage voices");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("voices")
        .insert({
          voice_id: newVoiceId,
          name: newVoiceName,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setVoices([data, ...voices]);
      setNewVoiceId("");
      setNewVoiceName("");
      toast.success(t.voiceAdded);
    } catch (error: any) {
      console.error("Error adding voice:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        toast.error("This voice ID already exists");
      } else {
        toast.error("Failed to add voice");
      }
    }
  };

  const handleDeleteVoice = async (id: string) => {
    if (!isAdminOrOwner) {
      toast.error("Only admins and owners can manage voices");
      return;
    }

    try {
      const { error } = await supabase.from("voices").delete().eq("id", id);

      if (error) throw error;

      setVoices(voices.filter((v) => v.id !== id));
      toast.success(t.voiceRemoved);
    } catch (error) {
      console.error("Error deleting voice:", error);
      toast.error("Failed to delete voice");
    }
  };

  // Language handler
  const handleSaveLanguage = async (lang: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          language: lang,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setLanguage(lang);
      localStorage.setItem("qlyra_language", lang);
      toast.success(t.languageSaved);

      // Reload page to apply language change
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error saving language:", error);
      toast.error("Failed to save language");
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed left-6 bottom-6 h-12 w-12 rounded-full shadow-hover bg-card border-border hover:bg-accent z-50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltipSettings}</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.settings}</DialogTitle>
            <DialogDescription>{t.settingsDescription}</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue={isAdminOrOwner ? "webhook" : "voices"}
            className="w-full flex-1 overflow-hidden flex flex-col"
          >
            <TabsList
              className={`grid w-full ${isAdminOrOwner ? "grid-cols-3" : "grid-cols-2"} shrink-0`}
            >
              {isAdminOrOwner && (
                <TabsTrigger value="webhook">{t.webhook}</TabsTrigger>
              )}
              <TabsTrigger value="voices">{t.voices}</TabsTrigger>
              <TabsTrigger value="language">{t.language}</TabsTrigger>
            </TabsList>

            {isAdminOrOwner && (
              <TabsContent
                value="webhook"
                className="space-y-4 flex-1 overflow-y-auto p-1"
              >
                <div className="space-y-4">
                  {/* Add New Webhook */}
                  <div className="grid gap-3 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{t.addNewWebhook}</p>
                    <div className="grid grid-cols-1 gap-2">
                      <Input
                        placeholder={t.webhookName}
                        value={newWebhookName}
                        onChange={(e) => setNewWebhookName(e.target.value)}
                        className="bg-background"
                      />
                      <Input
                        type="url"
                        placeholder={t.webhookUrlLabel}
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <Button
                      onClick={handleAddWebhook}
                      size="sm"
                      className="w-full"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addWebhookButton}
                    </Button>
                  </div>

                  {/* List Webhooks */}
                  <div className="space-y-2">
                    <Label>{t.savedWebhooks}</Label>
                    {loading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Loading...
                      </p>
                    ) : webhooks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t.noWebhooksConfigured}
                      </p>
                    ) : (
                      webhooks.map((webhook) => (
                        <div
                          key={webhook.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${webhook.active ? "border-primary bg-primary/5" : "border-border bg-background"}`}
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {webhook.name}
                              </p>
                              {webhook.active && (
                                <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                  {t.activeWebhook}
                                </span>
                              )}
                            </div>
                            <p
                              className="text-xs text-muted-foreground truncate"
                              title={webhook.url}
                            >
                              {webhook.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!webhook.active && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleSetActiveWebhook(webhook.id)
                                }
                                title={t.setActive}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              title={t.deleteWebhook}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            )}

            <TabsContent
              value="voices"
              className="space-y-4 flex-1 overflow-y-auto p-1"
            >
              <div className="space-y-4">
                {!isAdminOrOwner && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      {t.voicesReadOnly}
                    </p>
                  </div>
                )}
                {isAdminOrOwner && (
                  <>
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
                    <Button
                      onClick={handleAddVoice}
                      className="w-full"
                      variant="outline"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addVoice}
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Loading...
                  </p>
                ) : voices.length === 0 ? (
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
                        <p className="font-medium text-foreground">
                          {voice.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {voice.voice_id}
                        </p>
                      </div>
                      {isAdminOrOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVoice(voice.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="language"
              className="space-y-4 flex-1 overflow-y-auto p-1"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t.selectLanguage}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => handleSaveLanguage("en")}
                    className="w-full"
                    disabled={loading}
                  >
                    {t.english}
                  </Button>
                  <Button
                    variant={language === "tr" ? "default" : "outline"}
                    onClick={() => handleSaveLanguage("tr")}
                    className="w-full"
                    disabled={loading}
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
    </TooltipProvider>
  );
};

// Helper functions for backwards compatibility with existing code
export const getLanguage = () => {
  return localStorage.getItem("qlyra_language") || "en";
};

export const getConfiguredVoices = async (): Promise<Voice[]> => {
  try {
    const { data, error } = await supabase
      .from("voices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch voices:", error);
    return [];
  }
};

export const getActiveWebhook = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("webhooks")
      .select("url")
      .eq("active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.url || "";
  } catch (error) {
    console.error("Failed to fetch active webhook:", error);
    return "";
  }
};
