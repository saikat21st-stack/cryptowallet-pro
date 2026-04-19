import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Types "../types/portfolio";
import Common "../types/common";

module {
  public func seedAssets(assets : Map.Map<Common.CryptoSymbol, Types.CryptoAsset>) {
    // Only seed if empty
    if (not assets.isEmpty()) { return };
    let seed : [(Text, Text, Float)] = [
      ("BTC",  "Bitcoin",       67000.0),
      ("ETH",  "Ethereum",      3500.0),
      ("BNB",  "BNB",           580.0),
      ("SOL",  "Solana",        160.0),
      ("DOGE", "Dogecoin",      0.16),
      ("USDT", "Tether",        1.0),
      ("XRP",  "XRP",           0.55),
      ("ADA",  "Cardano",       0.45),
      ("MATIC","Polygon",       0.80),
      ("DOT",  "Polkadot",      8.0),
      ("AVAX", "Avalanche",     35.0),
      ("LINK", "Chainlink",     18.0),
      ("UNI",  "Uniswap",       10.0),
      ("ATOM", "Cosmos",        9.0),
      ("NEAR", "NEAR",          7.0),
      ("FTM",  "Fantom",        0.75),
      ("ALGO", "Algorand",      0.18),
      ("VET",  "VeChain",       0.035),
      ("SAND", "The Sandbox",   0.50),
      ("MANA", "Decentraland",  0.45),
      ("SHIB", "Shiba Inu",     0.000024),
      ("LTC",  "Litecoin",      85.0),
    ];
    for ((symbol, name, price) in seed.vals()) {
      let asset : Types.CryptoAsset = {
        symbol;
        name;
        var price;
        var priceChangePercent = 0.0;
      };
      assets.add(symbol, asset);
    };
  };

  public func getAllAssets(assets : Map.Map<Common.CryptoSymbol, Types.CryptoAsset>) : [Types.CryptoAssetPublic] {
    assets.entries()
      .map<(Common.CryptoSymbol, Types.CryptoAsset), Types.CryptoAssetPublic>(
        func((_, a)) { assetToPublic(a) }
      )
      .toArray();
  };

  public func getAsset(
    assets : Map.Map<Common.CryptoSymbol, Types.CryptoAsset>,
    symbol : Common.CryptoSymbol,
  ) : ?Types.CryptoAssetPublic {
    switch (assets.get(symbol)) {
      case (?a) { ?assetToPublic(a) };
      case null { null };
    };
  };

  public func updatePrices(assets : Map.Map<Common.CryptoSymbol, Types.CryptoAsset>) {
    // Pseudo-random ±5% price movement using time-based seed
    let seed = Time.now();
    var counter : Int = 0;
    for ((_, asset) in assets.entries()) {
      let raw : Int = ((seed + counter * 1_337) % 100) - 50; // -50..49
      let changePct : Float = raw.toFloat() * 0.1; // -5.0..4.9%
      let multiplier = 1.0 + (changePct / 100.0);
      let newPrice = asset.price * multiplier;
      asset.price := if (newPrice < 0.000001) 0.000001 else newPrice;
      asset.priceChangePercent := changePct;
      counter += 1;
    };
  };

  public func getUserHoldings(
    holdings : List.List<Types.Holding>,
    assets : Map.Map<Common.CryptoSymbol, Types.CryptoAsset>,
    userId : Common.UserId,
  ) : [Types.HoldingPublic] {
    holdings
      .filter(func(h : Types.Holding) : Bool { h.userId == userId })
      .filterMap<Types.Holding, Types.HoldingPublic>(func(h) {
        if (h.quantity <= 0.0) { null } else {
          switch (assets.get(h.symbol)) {
            case (?asset) {
              ?{
                symbol = h.symbol;
                quantity = h.quantity;
                currentPrice = asset.price;
                currentValue = h.quantity * asset.price;
              };
            };
            case null { null };
          };
        };
      })
      .toArray();
  };

  public func getOrCreateHolding(
    holdings : List.List<Types.Holding>,
    userId : Common.UserId,
    symbol : Common.CryptoSymbol,
  ) : Types.Holding {
    switch (holdings.find(func(h : Types.Holding) : Bool { h.userId == userId and h.symbol == symbol })) {
      case (?h) { h };
      case null {
        let h : Types.Holding = { userId; symbol; var quantity = 0.0 };
        holdings.add(h);
        h;
      };
    };
  };

  func assetToPublic(a : Types.CryptoAsset) : Types.CryptoAssetPublic {
    {
      symbol = a.symbol;
      name = a.name;
      price = a.price;
      priceChangePercent = a.priceChangePercent;
    };
  };
};
