import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  DollarSign,
  TicketCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";

function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
  accent,
}: {
  label: string;
  labelBn: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
  accent: string;
}) {
  return (
    <Card className="bg-card border-border relative overflow-hidden">
      <div
        className={`absolute inset-0 opacity-5 bg-gradient-to-br ${accent}`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent} bg-opacity-20 border border-current/10`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-3xl font-display font-bold text-foreground">
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { actor, isFetching } = useBackend();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      void navigate({ to: "/login" });
    }
  }, [isAdmin, authLoading, navigate]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (actor ? actor.adminGetAllUsers() : []),
    enabled: !!actor && !isFetching && isAdmin,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => (actor ? actor.adminGetAllOrders() : []),
    enabled: !!actor && !isFetching && isAdmin,
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: async () => (actor ? actor.adminGetAllTickets() : []),
    enabled: !!actor && !isFetching && isAdmin,
  });

  const totalVolume =
    orders?.reduce((sum, o) => sum + o.total, 0).toFixed(2) ?? "0";
  const openTickets = tickets?.filter((t) => t.status !== "closed").length ?? 0;

  const stats = [
    {
      label: "Total Users",
      labelBn: "মোট ইউজার",
      value: users?.length ?? 0,
      icon: Users,
      isLoading: usersLoading,
      accent: "from-primary to-primary/50 text-primary",
    },
    {
      label: "Total Trades",
      labelBn: "মোট ট্রেড",
      value: orders?.length ?? 0,
      icon: TrendingUp,
      isLoading: ordersLoading,
      accent: "from-chart-1 to-chart-1/50 text-chart-1",
    },
    {
      label: "Trade Volume (USD)",
      labelBn: "ট্রেড ভলিউম",
      value: `$${Number(totalVolume).toLocaleString()}`,
      icon: DollarSign,
      isLoading: ordersLoading,
      accent: "from-chart-2 to-chart-2/50 text-chart-2",
    },
    {
      label: "Open Tickets",
      labelBn: "খোলা টিকেট",
      value: openTickets,
      icon: TicketCheck,
      isLoading: ticketsLoading,
      accent: "from-destructive to-destructive/50 text-destructive",
    },
  ];

  return (
    <div className="p-6 space-y-6" data-ocid="admin.overview.page">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          সিস্টেম ওভারভিউ
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Platform statistics at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent trades */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                সাম্প্রতিক ট্রেড
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {ordersLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(orders ?? []).slice(0, 5).map((order, idx) => (
                  <div
                    key={String(order.id)}
                    className="flex items-center justify-between px-4 py-3"
                    data-ocid={`admin.overview.trade.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                          order.tradeType === "buy"
                            ? "bg-gain text-chart-1 border border-gain"
                            : "bg-loss text-destructive border border-loss"
                        }`}
                      >
                        {order.tradeType.toUpperCase()}
                      </span>
                      <span className="text-sm text-foreground font-mono">
                        {order.symbol}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                ))}
                {(orders ?? []).length === 0 && (
                  <p
                    className="text-center text-muted-foreground text-sm py-6"
                    data-ocid="admin.overview.trades.empty_state"
                  >
                    কোনো ট্রেড নেই
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <TicketCheck className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                সাম্প্রতিক টিকেট
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {ticketsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(tickets ?? []).slice(0, 5).map((ticket, idx) => (
                  <div
                    key={String(ticket.id)}
                    className="flex items-center justify-between px-4 py-3"
                    data-ocid={`admin.overview.ticket.item.${idx + 1}`}
                  >
                    <p className="text-sm text-foreground truncate max-w-[200px]">
                      {ticket.subject}
                    </p>
                    <TicketStatusBadge status={ticket.status as string} />
                  </div>
                ))}
                {(tickets ?? []).length === 0 && (
                  <p
                    className="text-center text-muted-foreground text-sm py-6"
                    data-ocid="admin.overview.tickets.empty_state"
                  >
                    কোনো টিকেট নেই
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-gain border-gain text-chart-1",
    in_progress: "bg-primary/10 border-primary/30 text-primary",
    closed: "bg-muted border-border text-muted-foreground",
  };
  const labels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    closed: "Closed",
  };
  return (
    <span
      className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
