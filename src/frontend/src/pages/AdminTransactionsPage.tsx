import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTransactionsPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { actor, isFetching } = useBackend();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "buy" | "sell">("all");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      void navigate({ to: "/login" });
    }
  }, [isAdmin, authLoading, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => (actor ? actor.adminGetAllOrders() : []),
    enabled: !!actor && !isFetching && isAdmin,
  });

  const filtered = (orders ?? []).filter((o) => {
    const matchSearch =
      o.symbol.toLowerCase().includes(search.toLowerCase()) ||
      o.userId.toString().includes(search);
    const matchType =
      typeFilter === "all" || (o.tradeType as string) === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 space-y-5" data-ocid="admin.transactions.page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            সমস্ত ট্রানজেকশন
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            All trade orders across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Type filter tabs */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(["all", "buy", "sell"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono uppercase transition-smooth ${
                  typeFilter === t
                    ? t === "buy"
                      ? "bg-gain text-chart-1 border border-gain"
                      : t === "sell"
                        ? "bg-loss text-destructive border border-loss"
                        : "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`admin.transactions.filter.${t}`}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 w-52 bg-muted border-border"
              placeholder="Search symbol, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="admin.transactions.search_input"
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border px-4 py-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Trade Orders ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((order, idx) => (
                    <tr
                      key={String(order.id)}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.transactions.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-mono">
                          {order.userId.toString().slice(0, 16)}…
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-foreground text-xs bg-muted px-2 py-0.5 rounded">
                          {order.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                            (order.tradeType as string) === "buy"
                              ? "bg-gain border-gain text-chart-1 border"
                              : "bg-loss border-loss text-destructive border"
                          }`}
                        >
                          {(order.tradeType as string).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground text-xs">
                        {order.quantity.toFixed(6)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground text-xs">
                        $
                        {order.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-foreground text-xs">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(order.timestamp)}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-muted-foreground"
                        data-ocid="admin.transactions.empty_state"
                      >
                        কোনো ট্রানজেকশন পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
