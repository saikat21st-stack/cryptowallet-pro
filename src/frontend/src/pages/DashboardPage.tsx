import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import CryptoIcon from "../components/CryptoIcon";
import { PriceChange, USDDisplay } from "../components/NumberDisplay";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import type { CryptoAssetPublic, HoldingPublic } from "../types";

// ─── Data hooks ─────────────────────────────────────────────────────────────

function useAllAssets(refreshKey: number) {
  const { actor, isFetching } = useBackend();
  return useQuery<CryptoAssetPublic[]>({
    queryKey: ["assets", refreshKey],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssets();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

function useMyHoldings(refreshKey: number) {
  const { actor, isFetching } = useBackend();
  const { user } = useAuth();
  return useQuery<HoldingPublic[]>({
    queryKey: ["holdings", refreshKey, user?.id?.toText()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyHoldings();
    },
    enabled: !!actor && !isFetching && !!user,
    staleTime: 30_000,
  });
}

// ─── Helper: merge assets + holdings ────────────────────────────────────────

interface EnrichedRow {
  symbol: string;
  name: string;
  price: number;
  priceChangePercent: number;
  quantity: number;
  currentValue: number;
}

function buildRows(
  assets: CryptoAssetPublic[],
  holdings: HoldingPublic[],
): EnrichedRow[] {
  const holdMap = new Map<string, HoldingPublic>(
    holdings.map((h) => [h.symbol, h]),
  );
  return assets.map((a) => {
    const h = holdMap.get(a.symbol);
    return {
      symbol: a.symbol,
      name: a.name,
      price: a.price,
      priceChangePercent: a.priceChangePercent,
      quantity: h?.quantity ?? 0,
      currentValue: h?.currentValue ?? 0,
    };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  labelBn,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  labelBn: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "gain" | "loss" | "neutral";
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              {labelBn}
            </p>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <div
              className={cn(
                "text-2xl font-display font-bold tracking-tight",
                accent === "gain" && "text-gain",
                accent === "loss" && "text-loss",
                (!accent || accent === "neutral") && "text-foreground",
              )}
            >
              {value}
            </div>
            {sub && (
              <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
            )}
          </div>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
              accent === "gain" && "bg-gain border border-gain",
              accent === "loss" && "bg-loss border border-loss",
              (!accent || accent === "neutral") &&
                "bg-primary/10 border border-primary/20",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                accent === "gain" && "text-gain",
                accent === "loss" && "text-loss",
                (!accent || accent === "neutral") && "text-primary",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <tr>
      {["c1", "c2", "c3", "c4", "c5", "c6"].map((k) => (
        <td key={k} className="px-4 py-3">
          <Skeleton className="h-4 w-full bg-muted/60" />
        </td>
      ))}
    </tr>
  );
}

function TopHoldingsCard({ rows }: { rows: EnrichedRow[] }) {
  const held = rows
    .filter((r) => r.quantity > 0)
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 5);

  const total = held.reduce((s, r) => s + r.currentValue, 0);

  if (held.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            পোর্টফোলিও ব্রেকডাউন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="py-8 text-center text-muted-foreground text-sm"
            data-ocid="portfolio.empty_state"
          >
            <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p>এখনো কোনো হোল্ডিং নেই</p>
            <p className="text-xs mt-1">ট্রেডিং পেজ থেকে ক্রিপ্টো কিনুন</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          পোর্টফোলিও ব্রেকডাউন
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {held.map((row, idx) => {
          const pct = total > 0 ? (row.currentValue / total) * 100 : 0;
          return (
            <div
              key={row.symbol}
              className="flex items-center gap-3"
              data-ocid={`portfolio.breakdown.item.${idx + 1}`}
            >
              <CryptoIcon symbol={row.symbol} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {row.symbol}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <USDDisplay
                value={row.currentValue}
                className="text-sm text-foreground shrink-0"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading: assetsLoading } =
    useAllAssets(refreshKey);
  const { data: holdings = [], isLoading: holdingsLoading } =
    useMyHoldings(refreshKey);

  const isLoading = assetsLoading || holdingsLoading;
  const rows = buildRows(assets, holdings);

  // Portfolio stats
  const totalPortfolioValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const usdBalance = user?.usdBalance ?? 0;
  const totalBalance = usdBalance + totalPortfolioValue;

  // 24h P&L estimate (sum of each holding's value × changePercent)
  const pnl24h = rows
    .filter((r) => r.quantity > 0)
    .reduce((s, r) => s + r.currentValue * (r.priceChangePercent / 100), 0);
  const pnl24hPct =
    totalPortfolioValue > 0 ? (pnl24h / totalPortfolioValue) * 100 : 0;

  function handleRefresh() {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    queryClient.invalidateQueries({ queryKey: ["holdings"] });
    setTimeout(() => setIsRefreshing(false), 800);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            পোর্টফোলিও ড্যাশবোর্ড
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user ? `স্বাগতম, ${user.username}` : "আপনার পোর্টফোলিও দেখুন"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 shrink-0"
          data-ocid="dashboard.refresh_button"
        >
          <RefreshCw
            className={cn("w-4 h-4", isRefreshing && "animate-spin")}
          />
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          labelBn="মোট ব্যালেন্স"
          icon={Wallet}
          accent="neutral"
          value={
            isLoading ? (
              <Skeleton className="h-7 w-32 bg-muted/60" />
            ) : (
              <USDDisplay value={totalBalance} />
            )
          }
          sub={<span className="text-xs">USD + ক্রিপ্টো</span>}
        />
        <StatCard
          label="USD Cash"
          labelBn="নগদ ব্যালেন্স"
          icon={Wallet}
          accent="neutral"
          value={
            isLoading ? (
              <Skeleton className="h-7 w-32 bg-muted/60" />
            ) : (
              <USDDisplay value={usdBalance} />
            )
          }
          sub={<span className="text-xs">ট্রেডের জন্য উপলব্ধ</span>}
        />
        <StatCard
          label="Portfolio Value"
          labelBn="ক্রিপ্টো মূল্য"
          icon={BarChart3}
          accent="neutral"
          value={
            isLoading ? (
              <Skeleton className="h-7 w-32 bg-muted/60" />
            ) : (
              <USDDisplay value={totalPortfolioValue} />
            )
          }
          sub={<span className="text-xs">{holdings.length} টি সম্পদ</span>}
        />
        <StatCard
          label="24h Change"
          labelBn="২৪ঘ পরিবর্তন"
          icon={pnl24h >= 0 ? TrendingUp : TrendingDown}
          accent={pnl24h >= 0 ? "gain" : "loss"}
          value={
            isLoading ? (
              <Skeleton className="h-7 w-32 bg-muted/60" />
            ) : (
              <USDDisplay value={pnl24h} showSign />
            )
          }
          sub={
            isLoading ? null : (
              <PriceChange percent={pnl24hPct} className="text-xs" />
            )
          }
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Holdings table — takes 2 columns */}
        <div className="xl:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">
                সকল ক্রিপ্টো অ্যাসেট
              </CardTitle>
              <Badge
                variant="secondary"
                className="font-mono text-xs"
                data-ocid="dashboard.assets_count"
              >
                {assets.length} টি কয়েন
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  data-ocid="dashboard.assets_table"
                >
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        সম্পদ
                      </th>
                      <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium uppercase tracking-wider hidden sm:table-cell">
                        মূল্য
                      </th>
                      <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        পরিবর্তন
                      </th>
                      <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium uppercase tracking-wider hidden md:table-cell">
                        পরিমাণ
                      </th>
                      <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        মোট মূল্য
                      </th>
                      <th className="px-4 py-3 text-right text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading
                      ? ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map(
                          (k) => <RowSkeleton key={k} />,
                        )
                      : rows.map((row, idx) => (
                          <AssetRow
                            key={row.symbol}
                            row={row}
                            index={idx + 1}
                          />
                        ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <TopHoldingsCard rows={rows} />

          {/* Quick actions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                দ্রুত অ্যাকশন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/trading">
                <Button
                  className="w-full justify-start gap-3 bg-gain border border-gain text-gain hover:opacity-80"
                  variant="ghost"
                  data-ocid="dashboard.quick_buy_button"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  ক্রিপ্টো কিনুন
                </Button>
              </Link>
              <Link to="/trading">
                <Button
                  className="w-full justify-start gap-3 bg-loss border border-loss text-loss hover:opacity-80"
                  variant="ghost"
                  data-ocid="dashboard.quick_sell_button"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  ক্রিপ্টো বিক্রি করুন
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Asset row ───────────────────────────────────────────────────────────────

function AssetRow({ row, index }: { row: EnrichedRow; index: number }) {
  const hasHolding = row.quantity > 0;

  return (
    <tr
      className={cn(
        "transition-colors hover:bg-muted/30 group",
        hasHolding && "bg-primary/5",
      )}
      data-ocid={`dashboard.asset.item.${index}`}
    >
      {/* Asset identity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <CryptoIcon symbol={row.symbol} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm">{row.symbol}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[100px]">
              {row.name}
            </p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right hidden sm:table-cell">
        <USDDisplay
          value={row.price}
          decimals={row.price < 1 ? 4 : row.price < 100 ? 3 : 2}
          className="text-foreground"
        />
      </td>

      {/* 24h change */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {row.priceChangePercent >= 0 ? (
            <TrendingUp className="w-3 h-3 text-gain shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 text-loss shrink-0" />
          )}
          <PriceChange percent={row.priceChangePercent} />
        </div>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-right hidden md:table-cell">
        {hasHolding ? (
          <span className="font-mono text-sm text-foreground">
            {row.quantity.toLocaleString("en-US", {
              maximumFractionDigits: 6,
            })}
          </span>
        ) : (
          <span className="text-muted-foreground/40 text-xs">—</span>
        )}
      </td>

      {/* Total value */}
      <td className="px-4 py-3 text-right">
        {hasHolding ? (
          <USDDisplay value={row.currentValue} className="text-foreground" />
        ) : (
          <span className="text-muted-foreground/40 text-xs">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-smooth">
          <Link to="/trading">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-gain hover:bg-gain hover:text-gain"
              data-ocid={`dashboard.buy_button.${index}`}
            >
              কিনুন
            </Button>
          </Link>
          {hasHolding && (
            <Link to="/trading">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-loss hover:bg-loss hover:text-loss"
                data-ocid={`dashboard.sell_button.${index}`}
              >
                বিক্রি
              </Button>
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
