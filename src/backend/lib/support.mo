import List "mo:core/List";
import Time "mo:core/Time";
import SupportTypes "../types/support";
import Common "../types/common";

module {
  public func createTicket(
    tickets : List.List<SupportTypes.Ticket>,
    nextId : Nat,
    userId : Common.UserId,
    req : SupportTypes.CreateTicketRequest,
  ) : SupportTypes.TicketPublic {
    let ticket : SupportTypes.Ticket = {
      id = nextId;
      userId;
      subject = req.subject;
      message = req.message;
      var status = #open;
      var replies = [];
      createdAt = Time.now();
    };
    tickets.add(ticket);
    toPublic(ticket);
  };

  public func getUserTickets(
    tickets : List.List<SupportTypes.Ticket>,
    userId : Common.UserId,
  ) : [SupportTypes.TicketPublic] {
    tickets
      .filter(func(t : SupportTypes.Ticket) : Bool { t.userId == userId })
      .map<SupportTypes.Ticket, SupportTypes.TicketPublic>(func(t) { toPublic(t) })
      .toArray();
  };

  public func getAllTickets(
    tickets : List.List<SupportTypes.Ticket>,
  ) : [SupportTypes.TicketPublic] {
    tickets.map<SupportTypes.Ticket, SupportTypes.TicketPublic>(func(t) { toPublic(t) }).toArray();
  };

  public func replyToTicket(
    tickets : List.List<SupportTypes.Ticket>,
    callerId : Common.UserId,
    isAdmin : Bool,
    req : SupportTypes.ReplyTicketRequest,
  ) : { #ok; #err : Text } {
    switch (tickets.find(func(t : SupportTypes.Ticket) : Bool { t.id == req.ticketId })) {
      case (?ticket) {
        switch (ticket.status) {
          case (#closed) { return #err("Ticket is closed") };
          case (_) {};
        };
        let reply : SupportTypes.TicketReply = {
          authorId = callerId;
          isAdmin;
          message = req.message;
          timestamp = Time.now();
        };
        // Append new reply to the existing replies array
        ticket.replies := ticket.replies.concat([reply]);
        if (isAdmin) {
          ticket.status := #in_progress;
        };
        #ok;
      };
      case null { #err("Ticket not found") };
    };
  };

  public func updateTicketStatus(
    tickets : List.List<SupportTypes.Ticket>,
    ticketId : Nat,
    status : Common.TicketStatus,
    callerRole : Common.Role,
  ) : { #ok; #err : Text } {
    switch (callerRole) {
      case (#admin) {};
      case (_) { return #err("Unauthorized") };
    };
    switch (tickets.find(func(t : SupportTypes.Ticket) : Bool { t.id == ticketId })) {
      case (?ticket) {
        ticket.status := status;
        #ok;
      };
      case null { #err("Ticket not found") };
    };
  };

  public func toPublic(ticket : SupportTypes.Ticket) : SupportTypes.TicketPublic {
    {
      id = ticket.id;
      userId = ticket.userId;
      subject = ticket.subject;
      message = ticket.message;
      status = ticket.status;
      replies = ticket.replies;
      createdAt = ticket.createdAt;
    };
  };
};
