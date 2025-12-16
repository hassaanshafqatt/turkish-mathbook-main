import { AdminPanel } from "@/components/admin/AdminPanel";
import { UserMenu } from "@/components/auth/UserMenu";
import { SettingsDialog } from "@/components/SettingsDialog";
import { BookOpen, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-lg">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">
                    Qlyra
                  </h2>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
            <UserMenu />
          </div>
        </div>
      </nav>

      <SettingsDialog />

      {/* Main Content */}
      <AdminPanel />
    </div>
  );
};

export default Admin;
