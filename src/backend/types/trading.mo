import Common "common";

module {
  public type TradeOrder = {
    id : Nat;
    userId : Common.UserId;
    symbol : Common.CryptoSymbol;
    tradeType : Common.TradeType;
    quantity : Float;
    price : Float;
    total : Float;
    timestamp : Common.Timestamp;
  };

  public type PlaceOrderRequest = {
    symbol : Common.CryptoSymbol;
    tradeType : Common.TradeType;
    quantity : Float;
  };

  public type PlaceOrderResult = {
    #ok : TradeOrder;
    #err : Text;
  };
};
