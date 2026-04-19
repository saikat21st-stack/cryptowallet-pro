import List "mo:core/List";
import Runtime "mo:core/Runtime";
import UserTypes "../types/users";
import TradingTypes "../types/trading";
import SupportTypes "../types/support";
import TxTypes "../types/transactions";
import Common "../types/common";
import UserLib "../lib/users";
import SupportLib "../lib/support";
import TradingLib "../lib/trading";
import TxLib "../lib/transactions";

mixin (
  users : List.List<UserTypes.User>,
  orders : List.List<TradingTypes.TradeOrder>,
  tickets : List.List<SupportTypes.Ticket>,
  transactions : List.List<TxTypes.Transaction>,
) {

  public query ({ caller }) func adminGetAllUsers() : async [UserTypes.UserPublic] {
    assertAdmin(caller);
    UserLib.getAllPublic(users);
  };

  public query ({ caller }) func adminGetAllOrders() : async [TradingTypes.TradeOrder] {
    assertAdmin(caller);
    TradingLib.getAllOrders(orders);
  };

  public query ({ caller }) func adminGetAllTickets() : async [SupportTypes.TicketPublic] {
    assertAdmin(caller);
    SupportLib.getAllTickets(tickets);
  };

  public query ({ caller }) func adminGetAllTransactions() : async [TxTypes.Transaction] {
    assertAdmin(caller);
    TxLib.getAll(transactions);
  };

  public shared ({ caller }) func adminUpdateTicketStatus(ticketId : Nat, status : Common.TicketStatus) : async { #ok; #err : Text } {
    SupportLib.updateTicketStatus(tickets, ticketId, status, getRole(caller));
  };

  public shared ({ caller }) func adminAdjustUserBalance(targetId : Common.UserId, newBalance : Float) : async { #ok; #err : Text } {
    UserLib.adjustBalance(users, targetId, newBalance, getRole(caller));
  };

  public shared ({ caller }) func adminSuspendUser(targetId : Common.UserId) : async { #ok; #err : Text } {
    UserLib.setStatus(users, targetId, #suspended, getRole(caller));
  };

  public shared ({ caller }) func adminUnsuspendUser(targetId : Common.UserId) : async { #ok; #err : Text } {
    UserLib.setStatus(users, targetId, #active, getRole(caller));
  };

  func assertAdmin(caller : Principal) {
    switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) {
        switch (user.role) {
          case (#admin) {};
          case (_) { Runtime.trap("Unauthorized") };
        };
      };
      case null { Runtime.trap("Unauthorized") };
    };
  };

  func getRole(caller : Principal) : Common.Role {
    switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) { user.role };
      case null { #customer };
    };
  };

};
