import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TicketPublic {
    id: bigint;
    status: TicketStatus;
    subject: string;
    userId: UserId;
    createdAt: Timestamp;
    message: string;
    replies: Array<TicketReply>;
}
export interface PlaceOrderRequest {
    tradeType: TradeType;
    quantity: number;
    symbol: CryptoSymbol;
}
export type Timestamp = bigint;
export interface UserPublic {
    id: UserId;
    status: UserStatus;
    username: string;
    createdAt: Timestamp;
    role: Role;
    usdBalance: number;
}
export interface FaqEntryPublic {
    id: bigint;
    question: string;
    createdAt: Timestamp;
    answer: string;
    category: string;
}
export interface UpdateFaqRequest {
    id: bigint;
    question: string;
    answer: string;
    category: string;
}
export interface DepositResult {
    depositAmount: number;
    newBalance: number;
    bonusEarned: number;
}
export interface Transaction {
    id: bigint;
    userId: UserId;
    description: string;
    timestamp: Timestamp;
    txType: TxType;
    amount: number;
}
export interface Transfer {
    id: bigint;
    status: TransferStatus;
    userId: UserId;
    timestamp: Timestamp;
    toAddress: string;
    amount: number;
    symbol: CryptoSymbol;
}
export interface CryptoAssetPublic {
    name: string;
    priceChangePercent: number;
    price: number;
    symbol: CryptoSymbol;
}
export interface TradeOrder {
    id: bigint;
    total: number;
    tradeType: TradeType;
    userId: UserId;
    timestamp: Timestamp;
    quantity: number;
    price: number;
    symbol: CryptoSymbol;
}
export interface RegisterRequest {
    username: string;
    passwordHash: string;
}
export interface ReplyTicketRequest {
    ticketId: bigint;
    message: string;
}
export type PlaceOrderResult = {
    __kind__: "ok";
    ok: TradeOrder;
} | {
    __kind__: "err";
    err: string;
};
export interface TicketReply {
    authorId: UserId;
    message: string;
    timestamp: Timestamp;
    isAdmin: boolean;
}
export interface CreateFaqRequest {
    question: string;
    answer: string;
    category: string;
}
export interface HoldingPublic {
    currentPrice: number;
    currentValue: number;
    quantity: number;
    symbol: CryptoSymbol;
}
export type UserId = Principal;
export interface SendCryptoRequest {
    toAddress: string;
    amount: number;
    symbol: CryptoSymbol;
}
export type CryptoSymbol = string;
export interface CreateTicketRequest {
    subject: string;
    message: string;
}
export type SendCryptoResult = {
    __kind__: "ok";
    ok: Transfer;
} | {
    __kind__: "err";
    err: string;
};
export enum Role {
    admin = "admin",
    customer = "customer"
}
export enum TicketStatus {
    closed = "closed",
    in_progress = "in_progress",
    open = "open"
}
export enum TradeType {
    buy = "buy",
    sell = "sell"
}
export enum TransferStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TxType {
    trade = "trade",
    deposit = "deposit",
    bonus = "bonus",
    transfer = "transfer"
}
export enum UserStatus {
    active = "active",
    suspended = "suspended"
}
export interface backendInterface {
    adminAdjustUserBalance(targetId: UserId, newBalance: number): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAllOrders(): Promise<Array<TradeOrder>>;
    adminGetAllTickets(): Promise<Array<TicketPublic>>;
    adminGetAllTransactions(): Promise<Array<Transaction>>;
    adminGetAllUsers(): Promise<Array<UserPublic>>;
    adminSuspendUser(targetId: UserId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUnsuspendUser(targetId: UserId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateTicketStatus(ticketId: bigint, status: TicketStatus): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createFaq(req: CreateFaqRequest): Promise<{
        __kind__: "ok";
        ok: FaqEntryPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createTicket(req: CreateTicketRequest): Promise<TicketPublic>;
    deleteFaq(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deposit(amount: number): Promise<{
        __kind__: "ok";
        ok: DepositResult;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllAssets(): Promise<Array<CryptoAssetPublic>>;
    getAllFaq(): Promise<Array<FaqEntryPublic>>;
    getMyHoldings(): Promise<Array<HoldingPublic>>;
    getMyOrders(): Promise<Array<TradeOrder>>;
    getMyProfile(): Promise<UserPublic | null>;
    getMyTickets(): Promise<Array<TicketPublic>>;
    getMyTransactionHistory(): Promise<Array<Transaction>>;
    getMyTransfers(): Promise<Array<Transfer>>;
    placeOrder(req: PlaceOrderRequest): Promise<PlaceOrderResult>;
    register(req: RegisterRequest): Promise<{
        __kind__: "ok";
        ok: UserPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    replyToTicket(req: ReplyTicketRequest): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    sendCrypto(req: SendCryptoRequest): Promise<SendCryptoResult>;
    updateFaq(req: UpdateFaqRequest): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
