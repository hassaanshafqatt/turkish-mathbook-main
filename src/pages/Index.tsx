import { ProcessingForm } from "@/components/ProcessingForm";
import { SettingsDialog } from "@/components/SettingsDialog";
import { BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Index = () => {
  const t = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SettingsDialog />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-6 shadow-hover">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </header>

        <div className="bg-card rounded-2xl shadow-card border border-border p-8 md:p-10">
          <ProcessingForm />
        </div>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
