import { TradeType } from "@/backend";
import CryptoIcon from "@/components/CryptoIcon";
import {
  CryptoAmount,
  PriceChange,
  USDDisplay,
} from "@/components/NumberDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import type { CryptoAssetPublic, HoldingPublic, TradeOrder } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Data hooks ────────────────────────────────────────────────────────────────

function useAssets() {
  const { actor, isFetching } = useBackend();
  return useQuery<CryptoAssetPublic[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssets();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

function useHoldings() {
  const { actor, isFetching } = useBackend();
  return useQuery<HoldingPublic[]>({
    queryKey: ["holdings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyHoldings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 8_000,
    refetchInterval: 15_000,
  });
}

function useOrders() {
  const { actor, isFetching } = useBackend();
  return useQuery<TradeOrder[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 8_000,
  });
}

// ─── Order history ─────────────────────────────────────────────────────────────

function OrderHistoryTable({
  orders,
  isLoading,
}: { orders: TradeOrder[]; isLoading: boolean }) {
  const sorted = useMemo(
    () => [...orders].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [orders],
  );

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div
        data-ocid="orders.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">কোনো অর্ডার নেই</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          আপনার প্রথম ট্রেড করুন
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">
              অ্যাসেট
            </TableHead>
            <TableHead className="text-muted-foreground font-medium">
              ধরন
            </TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">
              পরিমাণ
            </TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">
              মূল্য
            </TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">
              মোট
            </TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">
              তারিখ
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((order, idx) => {
            const isBuy = order.tradeType === TradeType.buy;
            const date = new Date(Number(order.timestamp) / 1_000_000);
            return (
              <TableRow
                key={String(order.id)}
                data-ocid={`orders.item.${idx + 1}`}
                className="border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol={order.symbol} size="sm" />
                    <span className="font-medium font-mono text-sm">
                      {order.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      isBuy
                        ? "bg-gain border-gain text-chart-1 text-xs"
                        : "bg-loss border-loss text-destructive text-xs"
                    }
                    variant="outline"
                  >
                    {isBuy ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {isBuy ? "কেনা" : "বেচা"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <CryptoAmount
                    value={order.quantity}
                    symbol={order.symbol}
                    className="text-sm"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <USDDisplay value={order.price} className="text-sm" />
                </TableCell>
                <TableCell className="text-right">
                  <USDDisplay
                    value={order.total}
                    className="text-sm font-semibold"
                  />
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">
                  {date.toLocaleDateString("bn-BD", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Asset selector ────────────────────────────────────────────────────────────

interface AssetSelectorProps {
  assets: CryptoAssetPublic[];
  selected: CryptoAssetPublic | null;
  onSelect: (a: CryptoAssetPublic) => void;
}

function AssetSelector({ assets, selected, onSelect }: AssetSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  }, [assets, search]);

  return (
    <div className="relative">
      <button
        data-ocid="trading.asset_select"
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <CryptoIcon symbol={selected.symbol} size="md" />
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-foreground">
                  {selected.symbol}
                </span>
                <span className="text-muted-foreground text-sm truncate">
                  {selected.name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <USDDisplay
                  value={selected.price}
                  className="text-sm text-primary"
                />
                <PriceChange percent={selected.priceChangePercent} />
              </div>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">একটি অ্যাসেট বেছে নিন…</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="trading.asset_search_input"
                  placeholder="খুঁজুন…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 bg-background border-input text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.map((asset) => (
                <button
                  key={asset.symbol}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors text-left"
                  onClick={() => {
                    onSelect(asset);
                    setOpen(false);
                    setSearch("");
                  }}
                  aria-pressed={selected?.symbol === asset.symbol}
                >
                  <CryptoIcon symbol={asset.symbol} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">
                        {asset.symbol}
                      </span>
                      <span className="text-muted-foreground text-xs truncate">
                        {asset.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <USDDisplay
                      value={asset.price}
                      className="text-sm font-mono"
                    />
                    <PriceChange
                      percent={asset.priceChangePercent}
                      className="block text-xs"
                    />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                  কোনো ফলাফল নেই
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          aria-hidden
        />
      )}
    </div>
  );
}

// ─── Balance strip ─────────────────────────────────────────────────────────────

interface BalanceStripProps {
  usdBalance: number;
  holding: HoldingPublic | undefined;
  selectedSymbol: string;
  isLoading: boolean;
}

function BalanceStrip({
  usdBalance,
  holding,
  selectedSymbol,
  isLoading,
}: BalanceStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">আপনার USD ব্যালেন্স</p>
        {isLoading ? (
          <Skeleton className="h-6 w-28 mt-1" />
        ) : (
          <USDDisplay
            value={usdBalance}
            className="text-lg font-semibold text-foreground"
          />
        )}
      </div>
      <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">
          আপনার {selectedSymbol} হোল্ডিং
        </p>
        {isLoading ? (
          <Skeleton className="h-6 w-28 mt-1" />
        ) : holding ? (
          <CryptoAmount
            value={holding.quantity}
            symbol={selectedSymbol}
            className="text-lg font-semibold text-foreground"
          />
        ) : (
          <span className="text-lg font-semibold font-mono text-muted-foreground">
            0 {selectedSymbol}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Trade form ────────────────────────────────────────────────────────────────

type TradeMode = "buy" | "sell";
type InputMode = "usd" | "crypto";

interface TradeFormProps {
  mode: TradeMode;
  asset: CryptoAssetPublic;
  usdBalance: number;
  holding: HoldingPublic | undefined;
  onSuccess: () => void;
}

function TradeForm({
  mode,
  asset,
  usdBalance,
  holding,
  onSuccess,
}: TradeFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>(
    mode === "buy" ? "usd" : "crypto",
  );
  const [rawValue, setRawValue] = useState("");
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  const isBuy = mode === "buy";

  const numValue = Number.parseFloat(rawValue) || 0;

  const estimatedCrypto = isBuy
    ? inputMode === "usd"
      ? numValue / asset.price
      : numValue
    : 0;

  const estimatedUSD = isBuy
    ? 0
    : inputMode === "crypto"
      ? numValue * asset.price
      : numValue;

  // Quantity in crypto to send to backend
  const quantityToSend: number = isBuy
    ? inputMode === "usd"
      ? numValue / asset.price
      : numValue
    : inputMode === "usd"
      ? numValue / asset.price
      : numValue;

  const costUSD = isBuy
    ? inputMode === "usd"
      ? numValue
      : numValue * asset.price
    : 0;

  const heldQty = holding?.quantity ?? 0;
  const sellQty = !isBuy
    ? inputMode === "usd"
      ? numValue / asset.price
      : numValue
    : 0;

  const isOverBudget = isBuy && costUSD > usdBalance;
  const isOverHolding = !isBuy && sellQty > heldQty;
  const isEmpty = numValue <= 0;

  let errorMsg = "";
  if (isOverBudget)
    errorMsg = `অপর্যাপ্ত USD ব্যালেন্স (উপলব্ধ: $${usdBalance.toFixed(2)})`;
  if (isOverHolding)
    errorMsg = `অপর্যাপ্ত ${asset.symbol} (উপলব্ধ: ${heldQty.toFixed(6)} ${asset.symbol})`;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.placeOrder({
        tradeType: isBuy ? TradeType.buy : TradeType.sell,
        symbol: asset.symbol,
        quantity: quantityToSend,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(
        isBuy
          ? `✅ ${asset.symbol} কেনা সফল হয়েছে!`
          : `✅ ${asset.symbol} বেচা সফল হয়েছে!`,
        { duration: 4000 },
      );
      setRawValue("");
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(`❌ ট্রেড ব্যর্থ: ${err.message}`, { duration: 5000 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || isOverBudget || isOverHolding) return;
    mutation.mutate();
  };

  const setPercent = useCallback(
    (pct: number) => {
      if (isBuy) {
        const amt = usdBalance * pct;
        setRawValue(amt.toFixed(2));
        setInputMode("usd");
      } else {
        const qty = heldQty * pct;
        setRawValue(qty.toFixed(8).replace(/\.?0+$/, ""));
        setInputMode("crypto");
      }
    },
    [isBuy, usdBalance, heldQty],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input mode toggle */}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setInputMode("usd")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-smooth ${
            inputMode === "usd"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          USD দিয়ে
        </button>
        <button
          type="button"
          onClick={() => setInputMode("crypto")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-smooth ${
            inputMode === "crypto"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {asset.symbol} দিয়ে
        </button>
      </div>

      {/* Main input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono pointer-events-none">
          {inputMode === "usd" ? "$" : asset.symbol}
        </div>
        <Input
          data-ocid={`trading.${mode}_amount_input`}
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          value={rawValue}
          onChange={(e) => setRawValue(e.target.value)}
          className={`pl-10 pr-4 h-12 text-lg font-mono bg-background border-input focus:border-primary transition-smooth ${
            errorMsg ? "border-destructive focus:border-destructive" : ""
          }`}
        />
      </div>

      {/* Quick percent buttons */}
      <div className="flex gap-2">
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => setPercent(pct)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-smooth border border-border/50"
          >
            {pct * 100}%
          </button>
        ))}
      </div>

      {/* Estimate */}
      <div
        className={`rounded-xl px-4 py-3 border text-sm flex items-center justify-between ${
          isBuy ? "bg-gain border-gain" : "bg-loss border-loss"
        }`}
      >
        <span className="text-muted-foreground">
          {isBuy ? "আনুমানিক প্রাপ্তি" : "আনুমানিক USD"}
        </span>
        <span
          className={`font-mono font-semibold ${isBuy ? "text-chart-1" : "text-destructive"}`}
        >
          {isBuy ? (
            <CryptoAmount value={estimatedCrypto} symbol={asset.symbol} />
          ) : (
            <USDDisplay value={estimatedUSD} />
          )}
        </span>
      </div>

      {/* Validation error */}
      {errorMsg && (
        <p
          data-ocid={`trading.${mode}_field_error`}
          className="text-destructive text-xs px-1"
        >
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <Button
        data-ocid={`trading.${mode}_submit_button`}
        type="submit"
        disabled={isEmpty || !!errorMsg || mutation.isPending}
        className={`w-full h-12 font-semibold text-base transition-smooth ${
          isBuy
            ? "bg-chart-1 hover:bg-chart-1/90 text-background"
            : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        }`}
      >
        {mutation.isPending ? (
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        ) : isBuy ? (
          <ArrowUpRight className="w-4 h-4 mr-2" />
        ) : (
          <ArrowDownRight className="w-4 h-4 mr-2" />
        )}
        {mutation.isPending
          ? "প্রক্রিয়াকরণ…"
          : isBuy
            ? `${asset.symbol} কিনুন`
            : `${asset.symbol} বেচুন`}
      </Button>

      {mutation.isPending && (
        <div data-ocid={`trading.${mode}_loading_state`} className="sr-only">
          অর্ডার প্রক্রিয়াকরণ হচ্ছে...
        </div>
      )}
    </form>
  );
}

// ─── Price ticker ──────────────────────────────────────────────────────────────

function PriceTicker({ asset }: { asset: CryptoAssetPublic }) {
  const isPositive = asset.priceChangePercent >= 0;
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">বর্তমান মূল্য</p>
        <motion.div
          key={asset.price}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <USDDisplay
            value={asset.price}
            decimals={asset.price < 1 ? 6 : asset.price < 100 ? 4 : 2}
            className="text-2xl font-bold text-foreground"
          />
        </motion.div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">২৪ঘন্টার পরিবর্তন</p>
        <div
          className={`flex items-center gap-1 ${isPositive ? "text-chart-1" : "text-destructive"}`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <PriceChange
            percent={asset.priceChangePercent}
            className="text-base"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        <Activity className="w-3 h-3" />
        <span>প্রতি ১৫ সেকেন্ডে আপডেট</span>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function TradingPage() {
  const { user } = useAuth();
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { data: holdings = [], isLoading: holdingsLoading } = useHoldings();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();

  const [selectedAsset, setSelectedAsset] = useState<CryptoAssetPublic | null>(
    null,
  );
  const [tradeTab, setTradeTab] = useState<TradeMode>("buy");

  // Auto-select BTC on first load
  useEffect(() => {
    if (!selectedAsset && assets.length > 0) {
      const btc = assets.find((a) => a.symbol === "BTC") ?? assets[0];
      setSelectedAsset(btc);
    }
  }, [assets, selectedAsset]);

  const selectedSymbol = selectedAsset?.symbol;

  // Keep selected asset price updated when assets refresh
  useEffect(() => {
    if (selectedSymbol && assets.length > 0) {
      const updated = assets.find((a) => a.symbol === selectedSymbol);
      if (updated) setSelectedAsset(updated);
    }
  }, [assets, selectedSymbol]);

  const holding = useMemo(
    () => holdings.find((h) => h.symbol === selectedAsset?.symbol),
    [holdings, selectedAsset],
  );

  const usdBalance = user?.usdBalance ?? 0;
  const isProfileLoading = !user;

  return (
    <div data-ocid="trading.page" className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            ট্রেডিং
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            ক্রিপ্টো কিনুন ও বেচুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left: Trade panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Asset selector */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              অ্যাসেট
            </h2>
            {assetsLoading ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : (
              <AssetSelector
                assets={assets}
                selected={selectedAsset}
                onSelect={setSelectedAsset}
              />
            )}

            {selectedAsset && <PriceTicker asset={selectedAsset} />}
          </div>

          {/* Balance strip */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              আপনার ব্যালেন্স
            </h2>
            <BalanceStrip
              usdBalance={usdBalance}
              holding={holding}
              selectedSymbol={selectedAsset?.symbol ?? "—"}
              isLoading={isProfileLoading || holdingsLoading}
            />
          </div>

          {/* Trade form */}
          {selectedAsset && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <Tabs
                value={tradeTab}
                onValueChange={(v) => setTradeTab(v as TradeMode)}
              >
                <TabsList className="w-full grid grid-cols-2 bg-muted/40">
                  <TabsTrigger
                    data-ocid="trading.buy_tab"
                    value="buy"
                    className="data-[state=active]:bg-chart-1 data-[state=active]:text-background font-semibold"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1.5" />
                    কিনুন
                  </TabsTrigger>
                  <TabsTrigger
                    data-ocid="trading.sell_tab"
                    value="sell"
                    className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground font-semibold"
                  >
                    <ArrowDownRight className="w-4 h-4 mr-1.5" />
                    বেচুন
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <TradeForm
                key={`${tradeTab}-${selectedAsset.symbol}`}
                mode={tradeTab}
                asset={selectedAsset}
                usdBalance={usdBalance}
                holding={holding}
                onSuccess={() => {}}
              />
            </div>
          )}
        </div>

        {/* Right: Order history */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-4 border-b border-border/50">
              <h2 className="font-display font-semibold text-foreground">
                অর্ডার ইতিহাস
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                আপনার সকল লেনদেন
              </p>
            </div>
            <OrderHistoryTable orders={orders} isLoading={ordersLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
