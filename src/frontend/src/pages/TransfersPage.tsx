import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CryptoIcon from "../components/CryptoIcon";
import { useBackend } from "../hooks/useBackend";
import { TransferStatus } from "../types";
import type { HoldingPublic, SendCryptoRequest, Transfer } from "../types";

// ─── Data hooks ──────────────────────────────────────────────────────────────

function useHoldings() {
  const { actor, isFetching } = useBackend();
  return useQuery<HoldingPublic[]>({
    queryKey: ["holdings"],
    queryFn: async () => (actor ? actor.getMyHoldings() : []),
    enabled: !!actor && !isFetching,
  });
}

function useTransfers() {
  const { actor, isFetching } = useBackend();
  return useQuery<Transfer[]>({
    queryKey: ["transfers"],
    queryFn: async () => (actor ? actor.getMyTransfers() : []),
    enabled: !!actor && !isFetching,
  });
}

function useSendCrypto() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: SendCryptoRequest) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.sendCrypto(req);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers"] });
      qc.invalidateQueries({ queryKey: ["holdings"] });
    },
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; labelBn: string; icon: React.ElementType; className: string }
> = {
  [TransferStatus.pending]: {
    label: "Pending",
    labelBn: "পেন্ডিং",
    icon: Clock,
    className: "bg-chart-5/10 text-chart-5 border-chart-5/25",
  },
  [TransferStatus.completed]: {
    label: "Completed",
    labelBn: "সম্পন্ন",
    icon: CheckCircle2,
    className: "bg-chart-2/10 text-chart-2 border-chart-2/25",
  },
  [TransferStatus.failed]: {
    label: "Failed",
    labelBn: "ব্যর্থ",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
};

function StatusBadge({ status }: { status: TransferStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[TransferStatus.pending];
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium text-xs ${cfg.className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, ocid }: { text: string; ocid: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy address"
      aria-label="Copy address"
      data-ocid={ocid}
      className="p-1 rounded hover:bg-muted/60 transition-smooth text-muted-foreground hover:text-foreground shrink-0"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-chart-1" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAddr(addr: string) {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function formatDate(ts: bigint) {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Send Form ────────────────────────────────────────────────────────────────

interface FormState {
  symbol: string;
  amount: string;
  toAddress: string;
}

interface ConfirmStep {
  symbol: string;
  amount: number;
  toAddress: string;
  holding: HoldingPublic;
}

function SendCryptoForm({ holdings }: { holdings: HoldingPublic[] }) {
  const [form, setForm] = useState<FormState>({
    symbol: "",
    amount: "",
    toAddress: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [confirm, setConfirm] = useState<ConfirmStep | null>(null);
  const [sent, setSent] = useState(false);
  const sendMutation = useSendCrypto();

  const selectedHolding =
    holdings.find((h) => h.symbol === form.symbol) ?? null;

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.symbol) errs.symbol = "ক্রিপ্টো নির্বাচন করুন";
    const amt = Number.parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt <= 0) {
      errs.amount = "বৈধ পরিমাণ লিখুন";
    } else if (selectedHolding && amt > selectedHolding.quantity) {
      errs.amount = `সর্বোচ্চ ${selectedHolding.quantity.toFixed(8)} ${form.symbol}`;
    }
    if (!form.toAddress.trim()) errs.toAddress = "প্রাপকের ঠিকানা লিখুন";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePreview = () => {
    if (!validate() || !selectedHolding) return;
    setConfirm({
      symbol: form.symbol,
      amount: Number.parseFloat(form.amount),
      toAddress: form.toAddress.trim(),
      holding: selectedHolding,
    });
  };

  const handleSend = async () => {
    if (!confirm) return;
    try {
      await sendMutation.mutateAsync({
        symbol: confirm.symbol,
        amount: confirm.amount,
        toAddress: confirm.toAddress,
      });
      setSent(true);
      setConfirm(null);
      setForm({ symbol: "", amount: "", toAddress: "" });
      toast.success("ক্রিপ্টো পাঠানো সফল হয়েছে!");
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "পাঠাতে ব্যর্থ হয়েছে");
    }
  };

  if (sent) {
    return (
      <div
        data-ocid="send.success_state"
        className="flex flex-col items-center justify-center py-12 gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-chart-1/10 border border-chart-1/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-chart-1" />
        </div>
        <p className="text-lg font-display font-semibold text-foreground">
          ট্রান্সফার সফল!
        </p>
        <p className="text-sm text-muted-foreground">
          আপনার ট্রান্সফার প্রক্রিয়াধীন রয়েছে
        </p>
      </div>
    );
  }

  if (confirm) {
    return (
      <div data-ocid="send.confirm_dialog" className="space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
          <CryptoIcon symbol={confirm.symbol} size="lg" />
          <div>
            <p className="text-xs text-muted-foreground">পাঠাচ্ছেন</p>
            <p className="text-xl font-display font-bold text-foreground">
              {confirm.amount.toFixed(8)}{" "}
              <span className="text-primary">{confirm.symbol}</span>
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              ≈ $
              {(confirm.amount * confirm.holding.currentPrice).toLocaleString(
                "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 },
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            প্রাপকের ঠিকানা
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm font-mono text-foreground break-all flex-1">
              {confirm.toAddress}
            </p>
            <CopyButton
              text={confirm.toAddress}
              ocid="send.confirm_copy_button"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg border border-yellow-500/25 bg-yellow-500/5 flex gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-400">
            এই ট্রান্সফার নিশ্চিত করলে তা পূর্বাবস্থায় ফেরানো যাবে না।
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setConfirm(null)}
            data-ocid="send.cancel_button"
            disabled={sendMutation.isPending}
          >
            বাতিল
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSend}
            disabled={sendMutation.isPending}
            data-ocid="send.confirm_button"
          >
            {sendMutation.isPending ? (
              <span className="animate-pulse">পাঠানো হচ্ছে…</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                নিশ্চিত করুন
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Crypto selector */}
      <div className="space-y-2">
        <Label htmlFor="crypto-select" className="text-sm text-foreground">
          ক্রিপ্টোকারেন্সি
        </Label>
        {holdings.length === 0 ? (
          <div
            data-ocid="send.empty_state"
            className="p-4 rounded-lg bg-muted/30 border border-border text-center"
          >
            <p className="text-sm text-muted-foreground">
              কোনো হোল্ডিং নেই। প্রথমে ট্রেড করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
            {holdings.map((h) => (
              <button
                key={h.symbol}
                type="button"
                data-ocid={`send.crypto_select.${h.symbol.toLowerCase()}`}
                onClick={() => {
                  setForm((f) => ({ ...f, symbol: h.symbol, amount: "" }));
                  setErrors((e) => ({ ...e, symbol: undefined }));
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-smooth ${
                  form.symbol === h.symbol
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <CryptoIcon symbol={h.symbol} size="sm" />
                <span className="flex-1 text-sm font-medium text-foreground">
                  {h.symbol}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {h.quantity.toFixed(6)}
                </span>
                {form.symbol === h.symbol && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
        {errors.symbol && (
          <p
            data-ocid="send.symbol.field_error"
            className="text-xs text-destructive mt-1"
          >
            {errors.symbol}
          </p>
        )}
      </div>

      {/* Available balance */}
      {selectedHolding && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border">
          <span className="text-xs text-muted-foreground">উপলব্ধ</span>
          <button
            type="button"
            className="text-xs font-mono text-primary hover:underline"
            onClick={() =>
              setForm((f) => ({
                ...f,
                amount: selectedHolding.quantity.toString(),
              }))
            }
            data-ocid="send.max_button"
          >
            {selectedHolding.quantity.toFixed(8)} {selectedHolding.symbol}
          </button>
        </div>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount-input" className="text-sm text-foreground">
          পরিমাণ
        </Label>
        <Input
          id="amount-input"
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => {
            setForm((f) => ({ ...f, amount: e.target.value }));
            setErrors((e2) => ({ ...e2, amount: undefined }));
          }}
          className="font-mono bg-card border-input"
          data-ocid="send.amount_input"
        />
        {errors.amount && (
          <p
            data-ocid="send.amount.field_error"
            className="text-xs text-destructive"
          >
            {errors.amount}
          </p>
        )}
        {selectedHolding &&
          form.amount &&
          !Number.isNaN(Number.parseFloat(form.amount)) && (
            <p className="text-xs text-muted-foreground font-mono">
              ≈ $
              {(
                Number.parseFloat(form.amount) * selectedHolding.currentPrice
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </p>
          )}
      </div>

      {/* Recipient address */}
      <div className="space-y-2">
        <Label htmlFor="address-input" className="text-sm text-foreground">
          প্রাপকের ওয়ালেট ঠিকানা
        </Label>
        <Input
          id="address-input"
          type="text"
          placeholder="0x... বা wallet address"
          value={form.toAddress}
          onChange={(e) => {
            setForm((f) => ({ ...f, toAddress: e.target.value }));
            setErrors((e2) => ({ ...e2, toAddress: undefined }));
          }}
          className="font-mono text-sm bg-card border-input"
          data-ocid="send.address_input"
        />
        {errors.toAddress && (
          <p
            data-ocid="send.address.field_error"
            className="text-xs text-destructive"
          >
            {errors.toAddress}
          </p>
        )}
      </div>

      <Button
        className="w-full gap-2"
        onClick={handlePreview}
        disabled={holdings.length === 0}
        data-ocid="send.preview_button"
      >
        <ArrowRight className="w-4 h-4" />
        পরবর্তী — নিশ্চিতকরণ
      </Button>
    </div>
  );
}

// ─── Transfer History ─────────────────────────────────────────────────────────

function TransferHistory({
  transfers,
  isLoading,
}: { transfers: Transfer[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="transfers.loading_state">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
          >
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div
        data-ocid="transfers.empty_state"
        className="flex flex-col items-center justify-center py-16 gap-3"
      >
        <div className="w-14 h-14 rounded-full bg-muted/40 border border-border flex items-center justify-center">
          <Send className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-base font-display font-semibold text-foreground">
          কোনো ট্রান্সফার নেই
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          আপনি এখনো কোনো ক্রিপ্টো পাঠাননি। উপরের ফর্ম ব্যবহার করে পাঠান।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-ocid="transfers.list">
      {/* Desktop table header */}
      <div className="hidden md:grid grid-cols-[2fr_2fr_2fr_1fr_1.5fr] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>সম্পদ</span>
        <span>পরিমাণ</span>
        <span>প্রাপক</span>
        <span>স্ট্যাটাস</span>
        <span className="text-right">তারিখ</span>
      </div>

      {transfers.map((t, idx) => (
        <div
          key={t.id.toString()}
          data-ocid={`transfers.item.${idx + 1}`}
          className="flex flex-col md:grid md:grid-cols-[2fr_2fr_2fr_1fr_1.5fr] gap-2 md:gap-4 items-start md:items-center px-4 py-3.5 rounded-xl border border-border bg-card hover:border-border/80 hover:bg-card/80 transition-smooth"
        >
          {/* Asset */}
          <div className="flex items-center gap-2.5">
            <CryptoIcon symbol={t.symbol} size="sm" />
            <span className="text-sm font-semibold text-foreground font-display">
              {t.symbol}
            </span>
          </div>

          {/* Amount */}
          <div>
            <span className="text-sm font-mono text-foreground">
              {t.amount.toFixed(8)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              {t.symbol}
            </span>
          </div>

          {/* Recipient */}
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-mono text-muted-foreground"
              title={t.toAddress}
            >
              {truncateAddr(t.toAddress)}
            </span>
            <CopyButton
              text={t.toAddress}
              ocid={`transfers.copy_button.${idx + 1}`}
            />
          </div>

          {/* Status */}
          <div>
            <StatusBadge status={t.status} />
          </div>

          {/* Date */}
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-mono">
              {formatDate(t.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransfersPage() {
  const { data: holdings = [], isLoading: holdingsLoading } = useHoldings();
  const { data: transfers = [], isLoading: transfersLoading } = useTransfers();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div data-ocid="transfers.page">
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          ক্রিপ্টো পাঠান
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          যেকোনো ওয়ালেট অ্যাড্রেসে ক্রিপ্টো ট্রান্সফার করুন
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        {/* Send form card */}
        <Card
          className="bg-card border-border shadow-sm"
          data-ocid="send.panel"
        >
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base font-display font-semibold text-foreground">
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-primary" />
              </div>
              ট্রান্সফার ফর্ম
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {holdingsLoading ? (
              <div className="space-y-4" data-ocid="send.loading_state">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <SendCryptoForm holdings={holdings} />
            )}
          </CardContent>
        </Card>

        {/* History section */}
        <div className="space-y-4" data-ocid="transfers.section">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">
              ট্রান্সফার হিস্টোরি
            </h2>
            {transfers.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground"
              >
                {transfers.length} টি রেকর্ড
              </Badge>
            )}
          </div>
          <TransferHistory
            transfers={[...transfers].sort(
              (a, b) => Number(b.timestamp) - Number(a.timestamp),
            )}
            isLoading={transfersLoading}
          />
        </div>
      </div>
    </div>
  );
}
