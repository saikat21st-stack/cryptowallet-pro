import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Ban, CheckCircle, DollarSign, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserStatus } from "../backend";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import type { UserPublic } from "../types";

function UserStatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <Badge
      variant="outline"
      className="bg-gain border-gain text-chart-1 font-mono text-xs"
    >
      Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-loss border-loss text-destructive font-mono text-xs"
    >
      Suspended
    </Badge>
  );
}

function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <Badge
      variant="outline"
      className="bg-destructive/10 border-destructive/30 text-destructive font-mono text-xs"
    >
      Admin
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-muted border-border text-muted-foreground font-mono text-xs"
    >
      Customer
    </Badge>
  );
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<UserPublic | null>(null);
  const [newBalance, setNewBalance] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      void navigate({ to: "/login" });
    }
  }, [isAdmin, authLoading, navigate]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (actor ? actor.adminGetAllUsers() : []),
    enabled: !!actor && !isFetching && isAdmin,
  });

  const suspendMutation = useMutation({
    mutationFn: async ({
      userId,
      suspend,
    }: {
      userId: UserPublic["id"];
      suspend: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = suspend
        ? await actor.adminSuspendUser(userId)
        : await actor.adminUnsuspendUser(userId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_, { suspend }) => {
      toast.success(suspend ? "ইউজার সাসপেন্ড করা হয়েছে" : "ইউজার সক্রিয় করা হয়েছে");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(String(e)),
  });

  const adjustMutation = useMutation({
    mutationFn: async ({
      userId,
      balance,
    }: {
      userId: UserPublic["id"];
      balance: number;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminAdjustUserBalance(userId, balance);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("ব্যালেন্স আপডেট হয়েছে");
      setAdjustTarget(null);
      setNewBalance("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(String(e)),
  });

  const filtered = (users ?? []).filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toString().includes(search),
  );

  return (
    <div className="p-6 space-y-5" data-ocid="admin.users.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            ইউজার ম্যানেজমেন্ট
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all platform users
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 w-64 bg-muted border-border"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="admin.users.search_input"
          />
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border px-4 py-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            All Users ({filtered.length})
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
                      Username
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      USD Balance
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((user, idx) => (
                    <tr
                      key={user.id.toString()}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`admin.users.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {user.username}
                        </span>
                        <span className="block text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                          {user.id.toString().slice(0, 20)}…
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role as string} />
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusBadge status={user.status as string} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        ${user.usdBalance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 gap-1 text-xs border-border hover:border-primary/50 hover:text-primary"
                            onClick={() => {
                              setAdjustTarget(user);
                              setNewBalance(user.usdBalance.toFixed(2));
                            }}
                            data-ocid={`admin.users.adjust_balance_button.${idx + 1}`}
                          >
                            <DollarSign className="w-3 h-3" />
                            Adjust
                          </Button>
                          {user.status === UserStatus.active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 gap-1 text-xs border-border hover:border-destructive/50 hover:text-destructive"
                              disabled={suspendMutation.isPending}
                              onClick={() =>
                                suspendMutation.mutate({
                                  userId: user.id,
                                  suspend: true,
                                })
                              }
                              data-ocid={`admin.users.suspend_button.${idx + 1}`}
                            >
                              {suspendMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Ban className="w-3 h-3" />
                              )}
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 gap-1 text-xs border-border hover:border-chart-1/50 hover:text-chart-1"
                              disabled={suspendMutation.isPending}
                              onClick={() =>
                                suspendMutation.mutate({
                                  userId: user.id,
                                  suspend: false,
                                })
                              }
                              data-ocid={`admin.users.unsuspend_button.${idx + 1}`}
                            >
                              {suspendMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Unsuspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-muted-foreground"
                        data-ocid="admin.users.empty_state"
                      >
                        কোনো ইউজার পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Balance Modal */}
      <Dialog
        open={!!adjustTarget}
        onOpenChange={(open) => {
          if (!open) {
            setAdjustTarget(null);
            setNewBalance("");
          }
        }}
      >
        <DialogContent
          className="bg-card border-border sm:max-w-sm"
          data-ocid="admin.users.adjust_balance.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              ব্যালেন্স পরিবর্তন
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              User:{" "}
              <span className="text-foreground font-medium">
                {adjustTarget?.username}
              </span>
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="balance-input"
                className="text-sm text-muted-foreground"
              >
                নতুন USD ব্যালেন্স
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="balance-input"
                  className="pl-9 bg-muted border-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0.00"
                  data-ocid="admin.users.adjust_balance.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                setAdjustTarget(null);
                setNewBalance("");
              }}
              data-ocid="admin.users.adjust_balance.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              disabled={adjustMutation.isPending || !newBalance}
              onClick={() => {
                if (adjustTarget) {
                  adjustMutation.mutate({
                    userId: adjustTarget.id,
                    balance: Number.parseFloat(newBalance),
                  });
                }
              }}
              data-ocid="admin.users.adjust_balance.confirm_button"
            >
              {adjustMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              সংরক্ষণ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
