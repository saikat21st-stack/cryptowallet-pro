import List "mo:core/List";
import Set "mo:core/Set";
import Map "mo:core/Map";
import UserTypes "types/users";
import PortfolioTypes "types/portfolio";
import TradingTypes "types/trading";
import TransferTypes "types/transfers";
import SupportTypes "types/support";
import FaqTypes "types/faq";
import TxTypes "types/transactions";
import Common "types/common";
import UsersApi "mixins/users-api";
import PortfolioApi "mixins/portfolio-api";
import TradingApi "mixins/trading-api";
import TransfersApi "mixins/transfers-api";
import SupportApi "mixins/support-api";
import FaqApi "mixins/faq-api";
import AdminApi "mixins/admin-api";
import PortfolioLib "lib/portfolio";
import FaqLib "lib/faq";

actor {
  // User state
  let users = List.empty<UserTypes.User>();

  // Portfolio state
  let holdings = List.empty<PortfolioTypes.Holding>();
  let assets = Map.empty<Common.CryptoSymbol, PortfolioTypes.CryptoAsset>();

  // Trading state
  let orders = List.empty<TradingTypes.TradeOrder>();

  // Transfer state
  let transfers = List.empty<TransferTypes.Transfer>();

  // Support state
  let tickets = List.empty<SupportTypes.Ticket>();

  // FAQ state
  let faqs = List.empty<FaqTypes.FaqEntry>();

  // Transaction state
  let transactions = List.empty<TxTypes.Transaction>();
  let bonusRecipients = Set.empty<Common.UserId>();

  // Seed initial data (idempotent — checks for empty before seeding)
  PortfolioLib.seedAssets(assets);
  FaqLib.seedFaq(faqs);

  // Mixins
  include UsersApi(users, transactions, bonusRecipients);
  include PortfolioApi(users, holdings, assets);
  include TradingApi(users, holdings, assets, orders);
  include TransfersApi(users, holdings, transfers);
  include SupportApi(users, tickets);
  include FaqApi(users, faqs);
  include AdminApi(users, orders, tickets, transactions);
};
