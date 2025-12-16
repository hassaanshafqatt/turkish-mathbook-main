import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const API_URL = import.meta.env.DEV
  ? "http://localhost:7893/api/env"
  : "/api/env";

interface Book {
  id: string;
  name: string;
  uploadedAt?: string;
}

export const UploadedBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booksWebhookUrl, setBooksWebhookUrl] = useState<string | null>(null);
  const t = useTranslation();

  useEffect(() => {
    const fetchEnvConfig = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) return;
        const data = await response.json();
        setBooksWebhookUrl(data.booksWebhookUrl);
      } catch (err) {
        console.error("Error fetching env config:", err);
      }
    };

    fetchEnvConfig();
  }, []);

  useEffect(() => {
    if (!booksWebhookUrl) {
      return;
    }

    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(booksWebhookUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();
        setBooks(data.books || []);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(t.fetchBooksError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [booksWebhookUrl, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {t.uploadedBooksTitle}
        </h2>
      </div>

      {!booksWebhookUrl && (
        <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          {t.noBooksWebhookConfigured}
        </p>
      )}

      {booksWebhookUrl && isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {booksWebhookUrl && error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {booksWebhookUrl && !isLoading && !error && books.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t.noBooksUploaded}
        </p>
      )}

      {booksWebhookUrl && !isLoading && !error && books.length > 0 && (
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {books.map((book, index) => (
            <Card
              key={book.id || index}
              className={cn(
                "p-4 bg-card hover:bg-accent/50 transition-colors duration-200",
                "border border-border hover:border-primary/30",
                "animate-fade-in",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {book.name}
                  </p>
                  {book.uploadedAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(book.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
