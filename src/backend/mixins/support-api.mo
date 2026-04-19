import List "mo:core/List";
import Runtime "mo:core/Runtime";
import SupportTypes "../types/support";
import UserTypes "../types/users";
import Common "../types/common";
import SupportLib "../lib/support";
import UserLib "../lib/users";

mixin (
  users : List.List<UserTypes.User>,
  tickets : List.List<SupportTypes.Ticket>,
) {
  var nextTicketId : Nat = 0;

  public shared ({ caller }) func createTicket(req : SupportTypes.CreateTicketRequest) : async SupportTypes.TicketPublic {
    switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) {
        switch (user.status) {
          case (#suspended) { Runtime.trap("Account is suspended") };
          case (_) {};
        };
      };
      case null { Runtime.trap("User not found") };
    };
    let pub = SupportLib.createTicket(tickets, nextTicketId, caller, req);
    nextTicketId += 1;
    pub;
  };

  public query ({ caller }) func getMyTickets() : async [SupportTypes.TicketPublic] {
    SupportLib.getUserTickets(tickets, caller);
  };

  public shared ({ caller }) func replyToTicket(req : SupportTypes.ReplyTicketRequest) : async { #ok; #err : Text } {
    let isAdmin = switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) { user.role == #admin };
      case null { false };
    };
    SupportLib.replyToTicket(tickets, caller, isAdmin, req);
  };

};
