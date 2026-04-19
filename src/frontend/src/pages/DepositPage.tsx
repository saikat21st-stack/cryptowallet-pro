import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  CheckCircle2,
  Clock,
  Gift,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import type { TradeOrder, Transfer } from "../types";

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useMyOrders() {
  const { actor, isFetching } = useBackend();
  const { user } = useAuth();
  return useQuery<TradeOrder[]>({
    queryKey: ["myOrders", user?.id?.toText()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching && !!user,
    staleTime: 30_000,
  });
}

function useMyTransfers() {
  const { actor, isFetching } = useBackend();
  const { user } = useAuth();
  return useQuery<Transfer[]>({
    queryKey: ["myTransfers", user?.id?.toText()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTransfers();
    },
    enabled: !!actor && !isFetching && !!user,
    staleTime: 30_000,
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepositRecord {
  id: string;
  type: "DEPOSIT" | "BONUS";
  amount: number;
  description: string;
  timestamp: number;
}

// ─── Offer Banner ─────────────────────────────────────────────────────────────

function OfferBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-6 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.72 0.18 85 / 0.15) 0%, oklch(0.68 0.26 140 / 0.15) 50%, oklch(0.72 0.18 85 / 0.1) 100%)",
        borderColor: "oklch(0.72 0.18 85 / 0.5)",
      }}
      data-ocid="deposit.offer_banner"
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
        style={{ background: "oklch(0.72 0.18 85 / 0.6)" }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15 pointer-events-none"
        style={{ background: "oklch(0.68 0.26 140 / 0.6)" }}
      />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
          style={{
            background: "oklch(0.72 0.18 85 / 0.25)",
            border: "1px solid oklch(0.72 0.18 85 / 0.4)",
          }}
        >
          <Gift className="w-8 h-8" style={{ color: "oklch(0.68 0.22 85)" }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.72 0.18 85 / 0.2)",
                color: "oklch(0.55 0.22 85)",
                border: "1px solid oklch(0.72 0.18 85 / 0.4)",
              }}
            >
              🎁 বিশেষ অফার
            </span>
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.68 0.26 140 / 0.15)",
                color: "oklch(0.45 0.2 140)",
                border: "1px solid oklch(0.68 0.26 140 / 0.3)",
              }}
            >
              LIMITED OFFER
            </span>
          </div>
          <h2
            className="text-2xl md:text-3xl font-display font-black leading-tight mb-1"
            style={{ color: "oklch(0.30 0.08 85)" }}
          >
            ১০ ডলার ডিপোজিট করুন, ২ ডলার বোনাস পান!
          </h2>
          <p className="text-sm md:text-base font-medium text-muted-foreground">
            Special Offer: Deposit $10 or more and get an instant $2 bonus —
            withdrawable immediately!
          </p>
        </div>

        {/* Badge */}
        <div
          className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.18 85) 0%, oklch(0.65 0.22 75) 100%)",
          }}
        >
          <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
            বোনাস
          </span>
          <span className="text-3xl font-black text-white leading-none">
            $2
          </span>
          <span className="text-xs font-bold text-white/90">FREE</span>
        </div>
      </div>

      {/* Conditions */}
      <div
        className="relative mt-4 pt-4 flex flex-wrap gap-4"
        style={{ borderTop: "1px solid oklch(0.72 0.18 85 / 0.2)" }}
      >
        {[
          { icon: Zap, text: "তাৎক্ষণিক ক্রেডিট", sub: "Instant credit" },
          {
            icon: ArrowDownCircle,
            text: "সাথে সাথে উত্তোলন",
            sub: "Instant withdrawal",
          },
          {
            icon: Sparkles,
            text: "প্রতি ডিপোজিটে প্রযোজ্য",
            sub: "Every deposit",
          },
        ].map(({ icon: Icon, text, sub }) => (
          <div key={text} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.68 0.26 140 / 0.15)" }}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.45 0.2 140)" }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">
                {text}
              </p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Deposit Form ─────────────────────────────────────────────────────────────

interface DepositFormProps {
  onSuccess: (record: DepositRecord) => void;
}

function DepositForm({ onSuccess }: DepositFormProps) {
  const { user, refetchUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastResult, setLastResult] = useState<{
    deposit: number;
    bonus: number;
    total: number;
  } | null>(null);
  const queryClient = useQueryClient();

  const numAmount = Number.parseFloat(amount) || 0;
  const bonus = numAmount >= 10 ? 2 : 0;
  const totalReceive = numAmount + bonus;
  const hasBonus = bonus > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (numAmount <= 0) return;

    setIsPending(true);
    // Simulate a short network delay for realism
    await new Promise((r) => setTimeout(r, 900));

    const bonusEarned = numAmount >= 10 ? 2 : 0;
    const result = {
      deposit: numAmount,
      bonus: bonusEarned,
      total: numAmount + bonusEarned,
    };
    setLastResult(result);
    setShowSuccess(true);

    const depositRecord: DepositRecord = {
      id: `dep-${Date.now()}`,
      type: "DEPOSIT",
      amount: numAmount,
      description: `Simulated deposit of $${numAmount.toFixed(2)}`,
      timestamp: Date.now(),
    };
    onSuccess(depositRecord);
    if (bonusEarned > 0) {
      onSuccess({
        id: `bon-${Date.now()}`,
        type: "BONUS",
        amount: bonusEarned,
        description: `Welcome bonus for $${numAmount.toFixed(2)}+ deposit`,
        timestamp: Date.now() + 1,
      });
    }

    toast.success(
      bonusEarned > 0
        ? `$${numAmount.toFixed(2)} ডিপোজিট + $${bonusEarned} বোনাস সফলভাবে যোগ হয়েছে!`
        : `$${numAmount.toFixed(2)} সফলভাবে ডিপোজিট হয়েছে!`,
      { duration: 5000 },
    );

    // Refresh user balance in auth context
    refetchUser();
    queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    queryClient.invalidateQueries({ queryKey: ["myTransfers"] });

    setAmount("");
    setIsPending(false);
  }

  return (
    <Card className="bg-card border-border" data-ocid="deposit.form_card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          ডিপোজিট করুন
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showSuccess && lastResult ? (
          <SuccessPanel
            result={lastResult}
            userBalance={user?.usdBalance ?? 0}
            onReset={() => setShowSuccess(false)}
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-ocid="deposit.form"
          >
            <div className="space-y-2">
              <Label
                htmlFor="depositAmount"
                className="text-sm font-medium text-foreground"
              >
                ডিপোজিটের পরিমাণ (USD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-sm">
                  $
                </span>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 font-mono text-lg h-12"
                  data-ocid="deposit.amount_input"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-mono font-semibold border transition-smooth",
                      numAmount === preset
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30",
                    )}
                    data-ocid={`deposit.preset_${preset}_button`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {numAmount > 0 && (
              <div
                className={cn(
                  "rounded-xl p-4 space-y-2 border transition-smooth",
                  hasBonus
                    ? "border-[oklch(0.72_0.18_85/0.4)]"
                    : "border-border",
                )}
                style={
                  hasBonus ? { background: "oklch(0.72 0.18 85 / 0.06)" } : {}
                }
                data-ocid="deposit.preview_panel"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  পেমেন্ট সারাংশ
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ডিপোজিট</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${numAmount.toFixed(2)}
                  </span>
                </div>
                {hasBonus && (
                  <div className="flex justify-between text-sm">
                    <span
                      className="flex items-center gap-1.5"
                      style={{ color: "oklch(0.55 0.22 85)" }}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      বোনাস 🎁
                    </span>
                    <span
                      className="font-mono font-bold"
                      style={{ color: "oklch(0.50 0.22 85)" }}
                    >
                      +$2.00
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between text-base font-bold pt-2"
                  style={{ borderTop: "1px solid oklch(0.7 0 0 / 0.15)" }}
                >
                  <span className="text-foreground">মোট প্রাপ্তি</span>
                  <span
                    className="font-mono"
                    style={{
                      color: hasBonus ? "oklch(0.50 0.22 85)" : undefined,
                    }}
                    data-ocid="deposit.total_preview"
                  >
                    ${totalReceive.toFixed(2)}
                  </span>
                </div>
                {!hasBonus && numAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 আরও ${(10 - numAmount).toFixed(2)} যোগ করুন এবং $2 বোনাস
                    পান!
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isPending || numAmount <= 0}
              className="w-full h-12 text-base font-semibold gap-2"
              data-ocid="deposit.submit_button"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  প্রসেস করা হচ্ছে...
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-5 h-5" />
                  {hasBonus ? "ডিপোজিট করুন + $2 বোনাস পান" : "ডিপোজিট করুন"}
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              এটি একটি সিমুলেটেড ডিপোজিট। বোনাস সাথে সাথে উত্তোলনযোগ্য।
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Success Panel ────────────────────────────────────────────────────────────

function SuccessPanel({
  result,
  userBalance,
  onReset,
}: {
  result: { deposit: number; bonus: number; total: number };
  userBalance: number;
  onReset: () => void;
}) {
  return (
    <div
      className="text-center space-y-5 py-2"
      data-ocid="deposit.success_state"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.68 0.26 140 / 0.15)",
            border: "2px solid oklch(0.68 0.26 140 / 0.4)",
          }}
        >
          <CheckCircle2
            className="w-8 h-8"
            style={{ color: "oklch(0.50 0.22 140)" }}
          />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-foreground">
            ডিপোজিট সফল! 🎉
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার অ্যাকাউন্টে সফলভাবে জমা হয়েছে
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4 space-y-2 border"
        style={{
          background: "oklch(0.68 0.26 140 / 0.06)",
          borderColor: "oklch(0.68 0.26 140 / 0.3)",
        }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ডিপোজিট</span>
          <span className="font-mono font-semibold text-foreground">
            ${result.deposit.toFixed(2)}
          </span>
        </div>
        {result.bonus > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: "oklch(0.55 0.22 85)" }}>🎁 বোনাস প্রাপ্তি</span>
            <span
              className="font-mono font-bold"
              style={{ color: "oklch(0.50 0.22 85)" }}
            >
              +${result.bonus.toFixed(2)}
            </span>
          </div>
        )}
        <div
          className="flex justify-between text-base font-bold pt-2"
          style={{ borderTop: "1px solid oklch(0.7 0 0 / 0.15)" }}
        >
          <span>মোট জমা</span>
          <span className="font-mono" style={{ color: "oklch(0.50 0.22 140)" }}>
            ${result.total.toFixed(2)}
          </span>
        </div>
        <div
          className="flex justify-between text-xs pt-1"
          style={{ borderTop: "1px solid oklch(0.7 0 0 / 0.1)" }}
        >
          <span className="text-muted-foreground">আপডেটেড ব্যালেন্স</span>
          <span className="font-mono text-foreground font-semibold">
            ${(userBalance + result.total).toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onReset}
        data-ocid="deposit.deposit_again_button"
      >
        আবার ডিপোজিট করুন
      </Button>
    </div>
  );
}

// ─── Transaction Table ────────────────────────────────────────────────────────

interface TxTableProps {
  records: DepositRecord[];
  isLoading: boolean;
}

function TxTable({ records, isLoading }: TxTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4" data-ocid="deposit.history.loading_state">
        {[1, 2, 3].map((k) => (
          <Skeleton key={k} className="h-12 w-full bg-muted/60" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div
        className="py-12 text-center text-muted-foreground"
        data-ocid="deposit.history.empty_state"
      >
        <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium">কোনো লেনদেন নেই</p>
        <p className="text-xs mt-1">প্রথম ডিপোজিট করুন উপরের ফর্ম ব্যবহার করে</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="deposit.history_table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
              ধরন
            </th>
            <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase tracking-wider">
              পরিমাণ
            </th>
            <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
              বিবরণ
            </th>
            <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">
              সময়
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((rec, idx) => (
            <tr
              key={rec.id}
              className="hover:bg-muted/20 transition-smooth"
              data-ocid={`deposit.history.item.${idx + 1}`}
            >
              <td className="px-4 py-3">
                <Badge
                  variant={rec.type === "BONUS" ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-mono",
                    rec.type === "BONUS" && "text-white",
                  )}
                  style={
                    rec.type === "BONUS"
                      ? {
                          background: "oklch(0.65 0.22 85)",
                          borderColor: "oklch(0.65 0.22 85)",
                        }
                      : {}
                  }
                >
                  {rec.type === "BONUS" ? "🎁 BONUS" : "⬇ DEPOSIT"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold">
                <span
                  className={rec.type === "BONUS" ? "" : "text-foreground"}
                  style={
                    rec.type === "BONUS" ? { color: "oklch(0.50 0.22 85)" } : {}
                  }
                >
                  +${rec.amount.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                {rec.description}
              </td>
              <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell font-mono">
                <div className="flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(rec.timestamp).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DepositPage() {
  const { user } = useAuth();
  const [localRecords, setLocalRecords] = useState<DepositRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "deposits" | "bonuses">(
    "all",
  );

  const { data: _orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: _transfers = [], isLoading: transfersLoading } =
    useMyTransfers();
  const isLoading = ordersLoading || transfersLoading;

  // Seed with some example history on first load
  useEffect(() => {
    const seeded: DepositRecord[] = [
      {
        id: "seed-1",
        type: "DEPOSIT",
        amount: 50,
        description: "Initial account funding",
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        id: "seed-2",
        type: "BONUS",
        amount: 2,
        description: "Welcome bonus for $50+ deposit",
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 + 1000,
      },
      {
        id: "seed-3",
        type: "DEPOSIT",
        amount: 25,
        description: "Simulated deposit of $25.00",
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
    ];
    setLocalRecords(seeded);
  }, []);

  function handleSuccess(record: DepositRecord) {
    setLocalRecords((prev) => [record, ...prev]);
  }

  const filteredRecords = localRecords.filter((r) => {
    if (activeTab === "deposits") return r.type === "DEPOSIT";
    if (activeTab === "bonuses") return r.type === "BONUS";
    return true;
  });

  const totalDeposited = localRecords
    .filter((r) => r.type === "DEPOSIT")
    .reduce((s, r) => s + r.amount, 0);
  const totalBonuses = localRecords
    .filter((r) => r.type === "BONUS")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          ডিপোজিট
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user
            ? `${user.username}, আপনার অ্যাকাউন্টে তহবিল যোগ করুন`
            : "আপনার অ্যাকাউন্টে তহবিল যোগ করুন"}
        </p>
      </div>

      {/* Offer Banner */}
      <OfferBanner />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card
          className="bg-card border-border"
          data-ocid="deposit.balance_card"
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              বর্তমান ব্যালেন্স
            </p>
            <p className="text-xl font-display font-bold text-foreground font-mono">
              ${(user?.usdBalance ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card
          className="bg-card border-border"
          data-ocid="deposit.total_deposited_card"
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              মোট ডিপোজিট
            </p>
            <p className="text-xl font-display font-bold text-foreground font-mono">
              ${totalDeposited.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card
          className="bg-card border-border col-span-2 sm:col-span-1"
          data-ocid="deposit.total_bonus_card"
          style={{ borderColor: "oklch(0.72 0.18 85 / 0.35)" }}
        >
          <CardContent className="p-4">
            <p
              className="text-xs uppercase tracking-wider mb-1 font-medium"
              style={{ color: "oklch(0.55 0.22 85)" }}
            >
              🎁 মোট বোনাস
            </p>
            <p
              className="text-xl font-display font-bold font-mono"
              style={{ color: "oklch(0.50 0.22 85)" }}
            >
              +${totalBonuses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main grid: form + history */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Deposit form — 2 cols */}
        <div className="lg:col-span-2">
          <DepositForm onSuccess={handleSuccess} />
        </div>

        {/* Transaction history — 3 cols */}
        <div className="lg:col-span-3">
          <Card
            className="bg-card border-border"
            data-ocid="deposit.history_card"
          >
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                লেনদেনের ইতিহাস
              </CardTitle>
              {/* Tabs */}
              <div
                className="flex gap-1 mt-3"
                role="tablist"
                aria-label="Transaction filter"
              >
                {(
                  [
                    { key: "all", label: "সকল" },
                    { key: "deposits", label: "ডিপোজিট" },
                    { key: "bonuses", label: "বোনাস 🎁" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth border",
                      activeTab === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                    )}
                    data-ocid={`deposit.history.${key}_tab`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <TxTable records={filteredRecords} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
