import List "mo:core/List";
import Map "mo:core/Map";
import TradingTypes "../types/trading";
import PortfolioTypes "../types/portfolio";
import UserTypes "../types/users";
import Common "../types/common";
import TradingLib "../lib/trading";

mixin (
  users : List.List<UserTypes.User>,
  holdings : List.List<PortfolioTypes.Holding>,
  assets : Map.Map<Common.CryptoSymbol, PortfolioTypes.CryptoAsset>,
  orders : List.List<TradingTypes.TradeOrder>,
) {
  var nextOrderId : Nat = 0;

  public shared ({ caller }) func placeOrder(req : TradingTypes.PlaceOrderRequest) : async TradingTypes.PlaceOrderResult {
    let result = TradingLib.placeOrder(orders, holdings, users, assets, nextOrderId, caller, req);
    switch (result) {
      case (#ok(_)) { nextOrderId += 1 };
      case (#err(_)) {};
    };
    result;
  };

  public query ({ caller }) func getMyOrders() : async [TradingTypes.TradeOrder] {
    TradingLib.getUserOrders(orders, caller);
  };

};
