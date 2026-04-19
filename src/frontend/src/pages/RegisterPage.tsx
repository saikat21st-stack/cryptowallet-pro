import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Role } from "../backend";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export default function RegisterPage() {
  const { login, loginStatus } = useAuth();
  const { actor } = useBackend();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = (): string => {
    if (!username.trim()) return "ইউজারনেম প্রয়োজন";
    if (username.length < 3) return "ইউজারনেম কমপক্ষে ৩ অক্ষর হতে হবে";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return "ইউজারনেমে শুধু অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করুন";
    if (password.length < 6) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে";
    if (password !== confirmPassword) return "পাসওয়ার্ড মিলছে না";
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!actor) {
      setError("সংযোগ স্থাপন হয়নি। আবার চেষ্টা করুন।");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await actor.register({
        username: username.trim(),
        passwordHash: hashPassword(password),
      });

      if (result.__kind__ === "ok") {
        setSuccess(true);
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        setTimeout(() => {
          if (result.ok.role === Role.admin) {
            navigate({ to: "/admin" });
          } else {
            navigate({ to: "/dashboard" });
          }
        }, 1500);
      } else {
        setError(result.err || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }
    } catch {
      setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const needsIdentity = loginStatus !== "success";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 mb-4">
            <UserPlus className="w-8 h-8 text-accent" />
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
              নতুন অ্যাকাউন্ট
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              বিনামূল্যে সাইন আপ করুন
            </p>
          </div>

          {/* Step 1: Must connect Internet Identity first */}
          {needsIdentity && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground font-medium mb-1">
                  প্রথম ধাপ
                </p>
                <p className="text-xs text-muted-foreground">
                  রেজিস্ট্রেশনের জন্য Internet Identity দিয়ে সংযুক্ত হন
                </p>
              </div>
              <Button
                className="w-full gap-2 h-11"
                onClick={login}
                disabled={loginStatus === "logging-in"}
                data-ocid="register.identity_button"
              >
                {loginStatus === "logging-in" ? (
                  <span className="animate-spin rounded-full w-4 h-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                Internet Identity দিয়ে সংযুক্ত হন
              </Button>
            </div>
          )}

          {/* Step 2: Registration form */}
          {!needsIdentity && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chart-1 shrink-0" />
                <p className="text-xs text-chart-1">
                  Internet Identity সংযুক্ত হয়েছে
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-username">ইউজারনেম</Label>
                <Input
                  id="reg-username"
                  type="text"
                  placeholder="আপনার পছন্দের ইউজারনেম"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  data-ocid="register.username_input"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করুন
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="শক্তিশালী পাসওয়ার্ড দিন"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    data-ocid="register.password_input"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="আবার পাসওয়ার্ড দিন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  data-ocid="register.confirm_password_input"
                  className="h-11"
                />
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  data-ocid="register.error_state"
                >
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg bg-chart-1/10 border border-chart-1/20"
                  data-ocid="register.success_state"
                >
                  <CheckCircle2 className="w-4 h-4 text-chart-1 shrink-0" />
                  <p className="text-sm text-chart-1">
                    রেজিস্ট্রেশন সফল! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 gap-2"
                disabled={isLoading || success}
                data-ocid="register.submit_button"
              >
                {isLoading ? (
                  <span className="animate-spin rounded-full w-4 h-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                অ্যাকাউন্ট তৈরি করুন
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                রেজিস্ট্রেশন করলে আপনি পাবেন $10,000 সিমুলেটেড ব্যালেন্স
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
            data-ocid="register.login_link"
          >
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
