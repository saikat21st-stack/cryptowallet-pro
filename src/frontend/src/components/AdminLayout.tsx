import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  LogOut,
  ShieldCheck,
  TicketCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: BarChart3, label: "Overview", labelBn: "ওভারভিউ" },
  { href: "/admin/users", icon: Users, label: "Users", labelBn: "ইউজার" },
  {
    href: "/admin/transactions",
    icon: ArrowLeftRight,
    label: "Transactions",
    labelBn: "ট্রানজেকশন",
  },
  {
    href: "/admin/tickets",
    icon: TicketCheck,
    label: "Support Tickets",
    labelBn: "সাপোর্ট টিকেট",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="flex flex-col w-64 bg-card border-r border-border shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-destructive/15 border border-destructive/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-foreground tracking-tight block">
              CryptoVault
            </span>
            <span className="text-xs text-destructive font-mono font-medium">
              ADMIN PANEL
            </span>
          </div>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <span className="text-xs font-mono text-destructive font-medium">
            🔐 RESTRICTED ACCESS
          </span>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 px-3 py-4 space-y-1"
          aria-label="Admin navigation"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? currentPath === "/admin"
                : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                data-ocid={`admin.nav.${item.label.toLowerCase().replace(" ", "_")}_link`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                  isActive
                    ? "bg-destructive/15 text-destructive border border-destructive/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive
                      ? "text-destructive"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-destructive" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Admin user section */}
        <div className="p-4 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
              <div className="w-8 h-8 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.username}
                </p>
                <p className="text-xs text-destructive font-mono">
                  Administrator
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={logout}
            data-ocid="admin.nav.logout_button"
          >
            <LogOut className="w-4 h-4" />
            লগআউট
          </Button>
        </div>

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
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Admin top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-destructive" />
            <h1 className="font-display font-semibold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-mono text-destructive font-medium">
              LIVE
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
