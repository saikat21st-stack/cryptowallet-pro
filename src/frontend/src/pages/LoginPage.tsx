import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";

export default function LoginPage() {
  const { login, loginStatus } = useAuth();
  const { actor } = useBackend();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"identity" | "credentials">("identity");

  const handleIdentityLogin = () => {
    login();
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("ইউজারনেম প্রয়োজন");
      return;
    }
    if (!actor) {
      setError("সংযোগ স্থাপন হয়নি। আবার চেষ্টা করুন।");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await actor.getMyProfile();
      if (result) {
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        if (result.role === "admin") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } else {
        setError("ইউজার পাওয়া যায়নি। রেজিস্ট্রেশন করুন।");
      }
    } catch {
      setError("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            CryptoVault
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            পেপার ট্রেডিং সিমুলেটর
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-elevated space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              লগইন করুন
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              আপনার অ্যাকাউন্টে প্রবেশ করুন
            </p>
          </div>

          {step === "identity" && (
            <div className="space-y-4">
              <Button
                className="w-full gap-2 h-11"
                onClick={handleIdentityLogin}
                disabled={loginStatus === "logging-in"}
                data-ocid="login.identity_button"
              >
                {loginStatus === "logging-in" ? (
                  <span className="animate-spin rounded-full w-4 h-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                Internet Identity দিয়ে লগইন
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2">অথবা</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => setStep("credentials")}
                data-ocid="login.username_step_button"
              >
                ইউজারনেম দিয়ে লগইন
              </Button>
            </div>
          )}

          {step === "credentials" && (
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ইউজারনেম</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="আপনার ইউজারনেম"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  data-ocid="login.username_input"
                  className="h-11"
                />
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  data-ocid="login.error_state"
                >
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => {
                    setStep("identity");
                    setError("");
                  }}
                  data-ocid="login.back_button"
                >
                  ফিরে যান
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 gap-2"
                  disabled={isLoading}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? (
                    <span className="animate-spin rounded-full w-4 h-4 border-2 border-primary-foreground border-t-transparent" />
                  ) : null}
                  লগইন
                </Button>
              </div>
            </form>
          )}

          {loginStatus === "success" && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-chart-1/10 border border-chart-1/20"
              data-ocid="login.success_state"
            >
              <CheckCircle2 className="w-4 h-4 text-chart-1 shrink-0" />
              <p className="text-sm text-chart-1">সফলভাবে সংযুক্ত হয়েছে!</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
            data-ocid="login.register_link"
          >
            রেজিস্ট্রেশন করুন
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          অ্যাডমিন?{" "}
          <Link
            to="/admin"
            className="text-destructive hover:underline"
            data-ocid="login.admin_link"
          >
            অ্যাডমিন প্যানেল
          </Link>
        </p>
      </div>
    </div>
  );
}
