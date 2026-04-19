import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownCircle,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Send,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    labelBn: "ড্যাশবোর্ড",
  },
  { href: "/trading", icon: TrendingUp, label: "Trading", labelBn: "ট্রেডিং" },
  { href: "/transfers", icon: Send, label: "Transfers", labelBn: "ট্রান্সফার" },
  {
    href: "/deposit",
    icon: ArrowDownCircle,
    label: "Deposit",
    labelBn: "ডিপোজিট 🎁",
    highlight: true,
  },
  { href: "/support", icon: MessageSquare, label: "Support", labelBn: "সাপোর্ট" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, loginStatus, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isAuthenticated = loginStatus === "success" && user !== null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent
          currentPath={currentPath}
          isAuthenticated={isAuthenticated}
          user={user}
          isLoading={isLoading}
          login={login}
          logout={logout}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <BrandLogo />
          <button
            onClick={() => setMobileOpen(false)}
            type="button"
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-smooth"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>
        <SidebarContent
          currentPath={currentPath}
          isAuthenticated={isAuthenticated}
          user={user}
          isLoading={isLoading}
          login={login}
          logout={logout}
          noHeader
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar — mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-xs">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-smooth"
            aria-label="Open menu"
            data-ocid="nav.menu_open"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <BrandLogo />
        </header>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
        <Wallet className="w-4 h-4 text-primary" />
      </div>
      <span className="font-display font-bold text-lg text-foreground tracking-tight">
        CryptoVault
      </span>
    </div>
  );
}

interface SidebarContentProps {
  currentPath: string;
  isAuthenticated: boolean;
  user: ReturnType<typeof useAuth>["user"];
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  noHeader?: boolean;
}

function SidebarContent({
  currentPath,
  isAuthenticated,
  user,
  isLoading,
  login,
  logout,
  noHeader,
}: SidebarContentProps) {
  return (
    <>
      {!noHeader && (
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <BrandLogo />
        </div>
      )}

      {/* Simulator badge */}
      <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-center">
        <span className="text-xs font-mono text-accent font-medium">
          🔬 SIMULATOR MODE
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(`${item.href}/`);
          const isHighlight =
            "highlight" in item && item.highlight && !isActive;
          return (
            <Link
              key={item.href}
              to={item.href}
              data-ocid={`nav.${item.label.toLowerCase()}_link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : isHighlight
                    ? "text-sidebar-foreground border hover:text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              style={
                isHighlight
                  ? {
                      background: "oklch(0.72 0.18 85 / 0.1)",
                      borderColor: "oklch(0.72 0.18 85 / 0.35)",
                    }
                  : {}
              }
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive
                    ? "text-primary"
                    : isHighlight
                      ? ""
                      : "text-muted-foreground group-hover:text-foreground",
                )}
                style={isHighlight ? { color: "oklch(0.55 0.22 85)" } : {}}
              />
              <span
                className="flex-1"
                style={
                  isHighlight
                    ? { color: "oklch(0.45 0.18 85)", fontWeight: 600 }
                    : {}
                }
              >
                {item.labelBn}
              </span>
              {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className="p-4">
        {isLoading ? (
          <div className="h-14 rounded-lg bg-sidebar-accent animate-pulse" />
        ) : isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary uppercase">
                  {user.username.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  $
                  {user.usdBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={logout}
              data-ocid="nav.logout_button"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </Button>
          </div>
        ) : (
          <Button
            className="w-full gap-2"
            onClick={login}
            data-ocid="nav.login_button"
          >
            <Wallet className="w-4 h-4" />
            লগইন করুন
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </>
  );
}
