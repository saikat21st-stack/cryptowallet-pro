import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TicketStatus } from "../backend";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import type { TicketPublic } from "../types";
import { TicketStatusBadge } from "./AdminPage";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_NEXT: Record<string, { label: string; next: TicketStatus }> = {
  open: { label: "Mark In Progress", next: TicketStatus.in_progress },
  in_progress: { label: "Mark Closed", next: TicketStatus.closed },
  closed: { label: "Reopen", next: TicketStatus.open },
};

function TicketDetail({
  ticket,
  onBack,
}: {
  ticket: TicketPublic;
  onBack: () => void;
}) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.replyToTicket({
        ticketId: ticket.id,
        message,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      setReply("");
      toast.success("রিপ্লাই পাঠানো হয়েছে");
      void queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    },
    onError: (e) => toast.error(String(e)),
  });

  const statusMutation = useMutation({
    mutationFn: async (status: TicketStatus) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminUpdateTicketStatus(ticket.id, status);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      void queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (e) => toast.error(String(e)),
  });

  const statusInfo = STATUS_NEXT[ticket.status as string];

  return (
    <div className="space-y-4" data-ocid="admin.ticket.detail.panel">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="admin.ticket.detail.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          সব টিকেট
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h3 className="text-lg font-display font-semibold text-foreground truncate">
            {ticket.subject}
          </h3>
          <TicketStatusBadge status={ticket.status as string} />
        </div>
        {statusInfo && (
          <Button
            size="sm"
            variant="outline"
            className="border-border shrink-0"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate(statusInfo.next)}
            data-ocid="admin.ticket.detail.status_button"
          >
            {statusMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : null}
            {statusInfo.label}
          </Button>
        )}
      </div>

      {/* Conversation */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border px-4 py-3">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
          {/* Original message */}
          <div
            className="flex gap-3 items-start"
            data-ocid="admin.ticket.detail.message.1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">
                  {ticket.userId.toString().slice(0, 14)}…
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground">
                {ticket.message}
              </div>
            </div>
          </div>

          {/* Replies */}
          {ticket.replies.map((r, i) => (
            <div
              key={`reply-${String(r.timestamp)}-${i}`}
              className={`flex gap-3 items-start ${r.isAdmin ? "flex-row-reverse" : ""}`}
              data-ocid={`admin.ticket.detail.reply.${i + 1}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  r.isAdmin
                    ? "bg-destructive/15 border-destructive/30"
                    : "bg-primary/15 border-primary/30"
                }`}
              >
                {r.isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-destructive" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div
                className={`flex-1 min-w-0 ${r.isAdmin ? "text-right" : ""}`}
              >
                <div
                  className={`flex items-center gap-2 mb-1 ${r.isAdmin ? "justify-end" : ""}`}
                >
                  <span className="text-xs font-semibold text-foreground">
                    {r.isAdmin
                      ? "Admin"
                      : `${r.authorId.toString().slice(0, 14)}…`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.timestamp)}
                  </span>
                </div>
                <div
                  className={`inline-block rounded-lg px-3 py-2 text-sm text-left ${
                    r.isAdmin
                      ? "bg-destructive/10 border border-destructive/20 text-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {r.message}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {/* Reply form */}
      {(ticket.status as string) !== "closed" && (
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <Textarea
              className="bg-muted border-input resize-none text-sm"
              rows={3}
              placeholder="রিপ্লাই লিখুন…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              data-ocid="admin.ticket.reply.textarea"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                className="gap-2"
                disabled={replyMutation.isPending || !reply.trim()}
                onClick={() => replyMutation.mutate(reply.trim())}
                data-ocid="admin.ticket.reply.submit_button"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                পাঠান
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { actor, isFetching } = useBackend();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_progress" | "closed"
  >("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketPublic | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      void navigate({ to: "/login" });
    }
  }, [isAdmin, authLoading, navigate]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: async () => (actor ? actor.adminGetAllTickets() : []),
    enabled: !!actor && !isFetching && isAdmin,
  });

  // Sync selected ticket when query data updates
  useEffect(() => {
    if (selectedTicket && tickets) {
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket]);

  const filtered = (tickets ?? []).filter((t) => {
    const matchSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userId.toString().includes(search);
    const matchStatus =
      statusFilter === "all" || (t.status as string) === statusFilter;
    return matchSearch && matchStatus;
  });

  if (selectedTicket) {
    return (
      <div className="p-6">
        <TicketDetail
          ticket={selectedTicket}
          onBack={() => setSelectedTicket(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5" data-ocid="admin.tickets.page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            সাপোর্ট টিকেট
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all customer support tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(["all", "open", "in_progress", "closed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold font-mono transition-smooth ${
                  statusFilter === s
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`admin.tickets.filter.${s}`}
              >
                {s === "in_progress"
                  ? "In Progress"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 w-52 bg-muted border-border"
              placeholder="Search subject, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="admin.tickets.search_input"
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border px-4 py-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            All Tickets ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
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
                      Subject
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Replies
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((ticket, idx) => (
                    <tr
                      key={String(ticket.id)}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setSelectedTicket(ticket)
                      }
                      data-ocid={`admin.tickets.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-mono">
                          {ticket.userId.toString().slice(0, 16)}…
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">
                          {ticket.subject}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TicketStatusBadge status={ticket.status as string} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          <span>{ticket.replies.length}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-3 text-xs border-border hover:border-primary/50 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                          }}
                          data-ocid={`admin.tickets.view_button.${idx + 1}`}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-muted-foreground"
                        data-ocid="admin.tickets.empty_state"
                      >
                        কোনো টিকেট পাওয়া যায়নি
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
