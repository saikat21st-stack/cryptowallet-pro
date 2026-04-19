module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type CryptoSymbol = Text;

  public type Role = {
    #customer;
    #admin;
  };

  public type UserStatus = {
    #active;
    #suspended;
  };

  public type TicketStatus = {
    #open;
    #in_progress;
    #closed;
  };

  public type TransferStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type TradeType = {
    #buy;
    #sell;
  };
};
