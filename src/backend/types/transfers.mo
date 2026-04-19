import Common "common";

module {
  public type Transfer = {
    id : Nat;
    userId : Common.UserId;
    symbol : Common.CryptoSymbol;
    amount : Float;
    toAddress : Text;
    status : Common.TransferStatus;
    timestamp : Common.Timestamp;
  };

  public type SendCryptoRequest = {
    symbol : Common.CryptoSymbol;
    amount : Float;
    toAddress : Text;
  };

  public type SendCryptoResult = {
    #ok : Transfer;
    #err : Text;
  };
};
