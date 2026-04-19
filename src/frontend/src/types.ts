// Re-export backend types for use throughout the frontend
export type {
  UserPublic,
  CryptoAssetPublic,
  HoldingPublic,
  TradeOrder,
  Transfer,
  TicketPublic,
  TicketReply,
  FaqEntryPublic,
  PlaceOrderRequest,
  PlaceOrderResult,
  SendCryptoRequest,
  SendCryptoResult,
  RegisterRequest,
  CreateTicketRequest,
  ReplyTicketRequest,
  CreateFaqRequest,
  UpdateFaqRequest,
  Timestamp,
  CryptoSymbol,
  UserId,
} from "./backend";

export {
  Role,
  TradeType,
  TransferStatus,
  TicketStatus,
  UserStatus,
} from "./backend";

// App-level types
export interface AuthUser {
  profile: import("./backend").UserPublic;
  isAdmin: boolean;
}

export type NavItem = {
  label: string;
  labelBn: string;
  href: string;
  icon: string;
};
