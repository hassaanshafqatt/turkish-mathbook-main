import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { BookOpen } from "lucide-react";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-6 shadow-xl">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          Questioneer
        </h1>
        <p className="text-muted-foreground text-lg">Sign in to continue</p>
      </div>
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
