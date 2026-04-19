import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import TradingTypes "../types/trading";
import PortfolioTypes "../types/portfolio";
import UsersTypes "../types/users";
import Common "../types/common";
import PortfolioLib "portfolio";

module {
  public func placeOrder(
    orders : List.List<TradingTypes.TradeOrder>,
    holdings : List.List<PortfolioTypes.Holding>,
    users : List.List<UsersTypes.User>,
    assets : Map.Map<Common.CryptoSymbol, PortfolioTypes.CryptoAsset>,
    nextId : Nat,
    userId : Common.UserId,
    req : TradingTypes.PlaceOrderRequest,
  ) : TradingTypes.PlaceOrderResult {
    // Find user
    let user = switch (users.find(func(u : UsersTypes.User) : Bool { u.id == userId })) {
      case (?u) { u };
      case null { return #err("User not found") };
    };
    // Check suspension
    switch (user.status) {
      case (#suspended) { return #err("Account is suspended") };
      case (_) {};
    };
    if (req.quantity <= 0.0) {
      return #err("Quantity must be positive");
    };
    // Find asset
    let asset = switch (assets.get(req.symbol)) {
      case (?a) { a };
      case null { return #err("Unknown crypto symbol") };
    };
    let price = asset.price;
    let total = price * req.quantity;

    switch (req.tradeType) {
      case (#buy) {
        if (user.usdBalance < total) {
          return #err("Insufficient USD balance");
        };
        user.usdBalance -= total;
        let holding = PortfolioLib.getOrCreateHolding(holdings, userId, req.symbol);
        holding.quantity += req.quantity;
      };
      case (#sell) {
        let holding = PortfolioLib.getOrCreateHolding(holdings, userId, req.symbol);
        if (holding.quantity < req.quantity) {
          return #err("Insufficient crypto balance");
        };
        holding.quantity -= req.quantity;
        user.usdBalance += total;
      };
    };

    let order : TradingTypes.TradeOrder = {
      id = nextId;
      userId;
      symbol = req.symbol;
      tradeType = req.tradeType;
      quantity = req.quantity;
      price;
      total;
      timestamp = Time.now();
    };
    orders.add(order);
    #ok(order);
  };

  public func getUserOrders(
    orders : List.List<TradingTypes.TradeOrder>,
    userId : Common.UserId,
  ) : [TradingTypes.TradeOrder] {
    orders.filter(func(o : TradingTypes.TradeOrder) : Bool { o.userId == userId }).toArray();
  };

  public func getAllOrders(
    orders : List.List<TradingTypes.TradeOrder>,
  ) : [TradingTypes.TradeOrder] {
    orders.toArray();
  };
};
