import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Search,
  Send,
  TicketIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBackend } from "../hooks/useBackend";
import type {
  CreateTicketRequest,
  FaqEntryPublic,
  ReplyTicketRequest,
  TicketPublic,
} from "../types";
import { TicketStatus } from "../types";

// ─── FAQ helpers ────────────────────────────────────────────────────────────

function groupFaqs(faqs: FaqEntryPublic[]) {
  return faqs.reduce<Record<string, FaqEntryPublic[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});
}

const STATIC_FAQS: FaqEntryPublic[] = [
  {
    id: 1n,
    category: "অ্যাকাউন্ট",
    question: "আমি কীভাবে আমার অ্যাকাউন্টে লগইন করব?",
    answer:
      "Internet Identity ব্যবহার করে লগইন করুন। সাইডবারে 'লগইন করুন' বাটনে ক্লিক করুন এবং Internet Identity দিয়ে প্রমাণ করুন।",
    createdAt: 0n,
  },
  {
    id: 2n,
    category: "অ্যাকাউন্ট",
    question: "আমার অ্যাকাউন্ট কি সুরক্ষিত?",
    answer:
      "হ্যাঁ। আপনার অ্যাকাউন্ট Internet Identity দ্বারা সুরক্ষিত যা ব্লকচেইন-ভিত্তিক পরিচয় যাচাই পদ্ধতি ব্যবহার করে।",
    createdAt: 0n,
  },
  {
    id: 3n,
    category: "ট্রেডিং",
    question: "পেপার ট্রেডিং কী?",
    answer:
      "পেপার ট্রেডিং হলো সিমুলেটেড ট্রেডিং যেখানে বাস্তব অর্থ ব্যবহার না করে মার্কেট অনুশীলন করা যায়। এটি বিনিয়োগ শেখার আদর্শ পরিবেশ।",
    createdAt: 0n,
  },
  {
    id: 4n,
    category: "ট্রেডিং",
    question: "আমি কোন কোন ক্রিপ্টোকারেন্সি ট্রেড করতে পারব?",
    answer:
      "Bitcoin, Ethereum, BNB, Solana, Dogecoin, USDT সহ ২০+ ক্রিপ্টোকারেন্সি ট্রেড করা সম্ভব।",
    createdAt: 0n,
  },
  {
    id: 5n,
    category: "ট্রান্সফার",
    question: "আমি কীভাবে ক্রিপ্টো পাঠাব?",
    answer:
      "Transfers পেজে গিয়ে প্রাপকের ওয়ালেট অ্যাড্রেস, পরিমাণ ও ক্রিপ্টো নির্বাচন করুন এবং পাঠান।",
    createdAt: 0n,
  },
  {
    id: 6n,
    category: "ট্রান্সফার",
    question: "ট্রান্সফার সম্পন্ন হতে কতক্ষণ লাগে?",
    answer:
      "এই সিমুলেটরে ট্রান্সফার তাৎক্ষণিক। বাস্তব নেটওয়ার্কে সময় নেটওয়ার্ক কনজেশনের উপর নির্ভর করে।",
    createdAt: 0n,
  },
  {
    id: 7n,
    category: "সাপোর্ট",
    question: "আমি কীভাবে সাপোর্ট টিকেট খুলব?",
    answer:
      "এই পেজে 'My Tickets' ট্যাবে গিয়ে 'নতুন টিকেট' বাটনে ক্লিক করুন এবং ফর্মটি পূরণ করুন।",
    createdAt: 0n,
  },
];

// ─── Ticket status badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TicketStatus }) {
  const config: Record<TicketStatus, { label: string; className: string }> = {
    [TicketStatus.open]: {
      label: "খোলা",
      className: "bg-primary/15 text-primary border border-primary/30",
    },
    [TicketStatus.in_progress]: {
      label: "প্রক্রিয়াধীন",
      className: "bg-chart-5/15 text-chart-5 border border-chart-5/30",
    },
    [TicketStatus.closed]: {
      label: "বন্ধ",
      className: "bg-muted text-muted-foreground border border-border",
    },
  };
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

// ─── Timestamp formatter ─────────────────────────────────────────────────────

function formatTs(ts: bigint): string {
  if (ts === 0n) return "—";
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FaqSection() {
  const { actor, isFetching } = useBackend();
  const [search, setSearch] = useState("");
  const [openIds, setOpenIds] = useState<Set<bigint>>(new Set());

  const { data: remoteFaqs, isLoading } = useQuery<FaqEntryPublic[]>({
    queryKey: ["faqs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFaq();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });

  const faqs = remoteFaqs && remoteFaqs.length > 0 ? remoteFaqs : STATIC_FAQS;

  const filtered = faqs.filter(
    (f) =>
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = groupFaqs(filtered);

  const toggle = (id: bigint) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="faq.search_input"
          className="pl-10 bg-card border-border"
          placeholder="প্রশ্ন খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl bg-card" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div
          data-ocid="faq.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>কোনো প্রশ্ন পাওয়া যায়নি।</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} data-ocid={`faq.category.${category}`}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {category}
            </h3>
            <div className="space-y-2">
              {items.map((faq, idx) => {
                const isOpen = openIds.has(faq.id);
                return (
                  <Card
                    key={faq.id.toString()}
                    className="bg-card border-border overflow-hidden"
                    data-ocid={`faq.item.${idx + 1}`}
                  >
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-smooth"
                      onClick={() => toggle(faq.id)}
                      aria-expanded={isOpen}
                      data-ocid={`faq.toggle.${idx + 1}`}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────

interface NewTicketFormProps {
  onSuccess: (ticket: TicketPublic) => void;
  onCancel: () => void;
}

function NewTicketForm({ onSuccess, onCancel }: NewTicketFormProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async (req: CreateTicketRequest) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTicket(req);
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      toast.success("টিকেট তৈরি হয়েছে!");
      onSuccess(ticket);
    },
    onError: () => {
      toast.error("টিকেট তৈরি করা যায়নি।");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    mutate({ subject: subject.trim(), message: message.trim() });
  };

  return (
    <Card
      className="bg-card border-border p-5 space-y-4"
      data-ocid="ticket.new_form"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          নতুন সাপোর্ট টিকেট
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-muted transition-smooth"
          aria-label="Close form"
          data-ocid="ticket.new_form.close_button"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ticket-subject" className="text-sm text-foreground">
            বিষয়
          </Label>
          <Input
            id="ticket-subject"
            data-ocid="ticket.subject_input"
            className="bg-background border-input"
            placeholder="সমস্যার সংক্ষিপ্ত বিবরণ"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ticket-message" className="text-sm text-foreground">
            বার্তা
          </Label>
          <Textarea
            id="ticket-message"
            data-ocid="ticket.message_textarea"
            className="bg-background border-input min-h-28 resize-none"
            placeholder="আপনার সমস্যার বিস্তারিত লিখুন..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            data-ocid="ticket.new_form.cancel_button"
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !subject.trim() || !message.trim()}
            data-ocid="ticket.new_form.submit_button"
          >
            {isPending ? (
              <span className="animate-pulse">পাঠানো হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                পাঠান
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── Ticket Detail View ───────────────────────────────────────────────────────

interface TicketDetailProps {
  ticket: TicketPublic;
  onBack: () => void;
}

function TicketDetail({ ticket, onBack }: TicketDetailProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [replyMsg, setReplyMsg] = useState("");

  const { mutate: sendReply, isPending } = useMutation({
    mutationFn: async (req: ReplyTicketRequest) => {
      if (!actor) throw new Error("Not connected");
      const res = await actor.replyToTicket(req);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      setReplyMsg("");
      toast.success("উত্তর পাঠানো হয়েছে!");
    },
    onError: () => {
      toast.error("উত্তর পাঠানো যায়নি।");
    },
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    sendReply({ ticketId: ticket.id, message: replyMsg.trim() });
  };

  const isClosed = ticket.status === TicketStatus.closed;

  return (
    <div className="space-y-4" data-ocid="ticket.detail">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="ticket.detail.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          ফিরে যান
        </Button>
      </div>

      <Card className="bg-card border-border p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground text-base truncate">
              {ticket.subject}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              টিকেট #{ticket.id.toString()} · {formatTs(ticket.createdAt)}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Original message */}
        <div className="rounded-lg bg-muted/40 p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1.5">আপনার বার্তা</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {ticket.message}
          </p>
        </div>

        {/* Thread replies */}
        {ticket.replies.length > 0 && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              কথোপকথন
            </p>
            {ticket.replies.map((reply, idx) => (
              <div
                key={`${reply.authorId.toString()}-${reply.timestamp.toString()}`}
                data-ocid={`ticket.reply.${idx + 1}`}
                className={`rounded-lg p-4 border ${
                  reply.isAdmin
                    ? "bg-primary/10 border-primary/20 ml-4"
                    : "bg-muted/30 border-border mr-4"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {reply.isAdmin ? "🛡 অ্যাডমিন" : "👤 আপনি"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTs(reply.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {reply.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {isClosed ? (
          <div className="text-center py-4 text-muted-foreground text-sm border-t border-border pt-4">
            এই টিকেটটি বন্ধ করা হয়েছে।
          </div>
        ) : (
          <form
            onSubmit={handleReply}
            className="space-y-3 border-t border-border pt-4"
          >
            <Textarea
              data-ocid="ticket.reply.textarea"
              className="bg-background border-input min-h-20 resize-none text-sm"
              placeholder="আপনার উত্তর লিখুন..."
              value={replyMsg}
              onChange={(e) => setReplyMsg(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !replyMsg.trim()}
                data-ocid="ticket.reply.submit_button"
              >
                {isPending ? (
                  <span className="animate-pulse">পাঠানো হচ্ছে...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    উত্তর দিন
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

// ─── My Tickets Section ───────────────────────────────────────────────────────

function MyTicketsSection() {
  const { actor, isFetching } = useBackend();
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketPublic | null>(
    null,
  );

  const { data: tickets, isLoading } = useQuery<TicketPublic[]>({
    queryKey: ["myTickets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTickets();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  if (selectedTicket) {
    // Sync latest data from cache
    const cached = tickets?.find((t) => t.id === selectedTicket.id);
    const live = cached ?? selectedTicket;
    return (
      <TicketDetail ticket={live} onBack={() => setSelectedTicket(null)} />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          আপনার সাপোর্ট টিকেট দেখুন বা নতুন টিকেট খুলুন।
        </p>
        {!showNewForm && (
          <Button
            size="sm"
            onClick={() => setShowNewForm(true)}
            className="gap-1.5 shrink-0"
            data-ocid="ticket.open_modal_button"
          >
            <Plus className="w-4 h-4" />
            নতুন টিকেট
          </Button>
        )}
      </div>

      {/* New ticket form */}
      {showNewForm && (
        <NewTicketForm
          onSuccess={(t) => {
            setShowNewForm(false);
            setSelectedTicket(t);
          }}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      {/* Ticket list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="ticket.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-card" />
          ))}
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div
          data-ocid="ticket.empty_state"
          className="text-center py-16 border border-dashed border-border rounded-xl"
        >
          <TicketIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground text-sm mb-4">
            কোনো সাপোর্ট টিকেট নেই।
          </p>
          {!showNewForm && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewForm(true)}
              data-ocid="ticket.empty_state.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              প্রথম টিকেট তৈরি করুন
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2" data-ocid="ticket.list">
          {tickets.map((ticket, idx) => (
            <button
              type="button"
              key={ticket.id.toString()}
              className="w-full text-left rounded-xl bg-card border border-border hover:border-primary/30 transition-smooth"
              data-ocid={`ticket.item.${idx + 1}`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {ticket.subject}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {ticket.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {formatTs(ticket.createdAt)}
                    </span>
                    {ticket.replies.length > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {ticket.replies.length} টি উত্তর
                      </span>
                    )}
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SupportPage ──────────────────────────────────────────────────────────────

export default function SupportPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6" data-ocid="support.page">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">
          সাপোর্ট কেন্দ্র
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          প্রশ্নের উত্তর খুঁজুন বা সাপোর্ট টিম-এর সাথে যোগাযোগ করুন।
        </p>
      </div>

      <Tabs defaultValue="faq" data-ocid="support.tabs">
        <TabsList className="bg-card border border-border w-full sm:w-auto">
          <TabsTrigger
            value="faq"
            className="flex-1 sm:flex-none gap-1.5"
            data-ocid="support.faq_tab"
          >
            <Search className="w-3.5 h-3.5" />
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="flex-1 sm:flex-none gap-1.5"
            data-ocid="support.tickets_tab"
          >
            <TicketIcon className="w-3.5 h-3.5" />
            আমার টিকেট
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-5">
          <FaqSection />
        </TabsContent>

        <TabsContent value="tickets" className="mt-5">
          <MyTicketsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
