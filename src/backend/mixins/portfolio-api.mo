import List "mo:core/List";
import Map "mo:core/Map";
import PortfolioTypes "../types/portfolio";
import UserTypes "../types/users";
import Common "../types/common";
import PortfolioLib "../lib/portfolio";
import UserLib "../lib/users";

mixin (
  users : List.List<UserTypes.User>,
  holdings : List.List<PortfolioTypes.Holding>,
  assets : Map.Map<Common.CryptoSymbol, PortfolioTypes.CryptoAsset>,
) {

  public query func getAllAssets() : async [PortfolioTypes.CryptoAssetPublic] {
    PortfolioLib.getAllAssets(assets);
  };

  public query ({ caller }) func getMyHoldings() : async [PortfolioTypes.HoldingPublic] {
    PortfolioLib.getUserHoldings(holdings, assets, caller);
  };

};
