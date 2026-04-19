import Common "common";

module {
  public type CryptoAsset = {
    symbol : Common.CryptoSymbol;
    name : Text;
    var price : Float;
    var priceChangePercent : Float;
  };

  public type CryptoAssetPublic = {
    symbol : Common.CryptoSymbol;
    name : Text;
    price : Float;
    priceChangePercent : Float;
  };

  public type Holding = {
    userId : Common.UserId;
    symbol : Common.CryptoSymbol;
    var quantity : Float;
  };

  public type HoldingPublic = {
    symbol : Common.CryptoSymbol;
    quantity : Float;
    currentPrice : Float;
    currentValue : Float;
  };
};
