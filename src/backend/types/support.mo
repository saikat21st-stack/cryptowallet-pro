import Common "common";

module {
  public type TicketReply = {
    authorId : Common.UserId;
    isAdmin : Bool;
    message : Text;
    timestamp : Common.Timestamp;
  };

  public type Ticket = {
    id : Nat;
    userId : Common.UserId;
    subject : Text;
    message : Text;
    var status : Common.TicketStatus;
    var replies : [TicketReply];
    createdAt : Common.Timestamp;
  };

  public type TicketPublic = {
    id : Nat;
    userId : Common.UserId;
    subject : Text;
    message : Text;
    status : Common.TicketStatus;
    replies : [TicketReply];
    createdAt : Common.Timestamp;
  };

  public type CreateTicketRequest = {
    subject : Text;
    message : Text;
  };

  public type ReplyTicketRequest = {
    ticketId : Nat;
    message : Text;
  };
};
