import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Stats, StatsResponse } from "@/types/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BookOpen,
  FileQuestion,
  TrendingUp,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { UserManagement } from "./UserManagement";
import { CreateUserDialog } from "./CreateUserDialog";

// Use environment variable directly instead of API endpoint
const STATS_WEBHOOK_URL = import.meta.env.VITE_STATS_WEBHOOK_URL || null;

export const AdminPanel = () => {
  const { isAdmin, isOwner } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsWebhookUrl] = useState<string | null>(STATS_WEBHOOK_URL);

  const fetchStats = async () => {
    if (!statsWebhookUrl) {
      return;
    }

    setStatsLoading(true);
    setStatsError(null);

    try {
      const response = await fetch(statsWebhookUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data: StatsResponse = await response.json();
      setStats({
        totalBooks: Number(data.total_books) || 0,
        totalQuestions: Number(data.total_questions) || 0,
        successRate: Number(data.success_rate) || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStatsError("Failed to load statistics. Please try again later.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (statsWebhookUrl && isAdmin) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsWebhookUrl, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users and view system statistics
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {isOwner ? "Owner" : "Admin"}
          </span>
        </div>
      </div>

      {/* Stats Dashboard */}
      {!statsWebhookUrl && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Statistics Not Configured
            </CardTitle>
            <CardDescription>
              Stats webhook not configured in environment variables. Set
              STATS_WEBHOOK_URL in .env to enable statistics.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {statsWebhookUrl && statsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {statsWebhookUrl && statsError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-destructive">
                Error Loading Statistics
              </CardTitle>
            </div>
            <CardDescription className="text-destructive/80">
              {statsError}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {statsWebhookUrl && !statsLoading && !statsError && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Books
                </CardTitle>
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalBooks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Books generated
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Questions
                </CardTitle>
                <FileQuestion className="w-5 h-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalQuestions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Questions extracted
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {(typeof stats.successRate === "number"
                  ? stats.successRate
                  : 0
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Processing success
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Users</h2>
            <p className="text-sm text-muted-foreground">
              Manage user accounts and roles
            </p>
          </div>
          <CreateUserDialog />
        </div>
        <UserManagement />
      </div>
    </div>
  );
};
