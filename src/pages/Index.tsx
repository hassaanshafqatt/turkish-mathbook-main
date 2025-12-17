import { ProcessingForm } from "@/components/ProcessingForm";
import { SettingsDialog } from "@/components/SettingsDialog";
import { UserMenu } from "@/components/auth/UserMenu";
import { UploadedBooks } from "@/components/UploadedBooks";
import { Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/Logo";

const Index = () => {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo
                showText={false}
                size="md"
                className="text-primary-foreground"
              />
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Qlyra
                </h2>
                <p className="text-xs text-muted-foreground">AI Generator</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </nav>

      <SettingsDialog />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Education
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </header>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-6 md:p-10 hover:shadow-2xl transition-shadow duration-300">
              <ProcessingForm />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Uploaded Books Section */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-6 hover:shadow-2xl transition-shadow duration-300">
                <UploadedBooks />
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t.quickTips}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.quickTip1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.quickTip2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.quickTip3}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.quickTip4}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50">
          <div className="text-center space-y-4">
            <Separator className="mb-4" />
            <p className="text-sm text-muted-foreground">{t.footer}</p>
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} Qlyra. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
