import List "mo:core/List";
import Runtime "mo:core/Runtime";
import TransferTypes "../types/transfers";
import PortfolioTypes "../types/portfolio";
import UserTypes "../types/users";
import Common "../types/common";
import TransferLib "../lib/transfers";
import UserLib "../lib/users";

mixin (
  users : List.List<UserTypes.User>,
  holdings : List.List<PortfolioTypes.Holding>,
  transfers : List.List<TransferTypes.Transfer>,
) {
  var nextTransferId : Nat = 0;

  public shared ({ caller }) func sendCrypto(req : TransferTypes.SendCryptoRequest) : async TransferTypes.SendCryptoResult {
    // Check user exists and is active
    switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) {
        switch (user.status) {
          case (#suspended) { return #err("Account is suspended") };
          case (_) {};
        };
      };
      case null { return #err("User not found") };
    };
    let result = TransferLib.sendCrypto(transfers, holdings, nextTransferId, caller, req);
    switch (result) {
      case (#ok(_)) { nextTransferId += 1 };
      case (#err(_)) {};
    };
    result;
  };

  public query ({ caller }) func getMyTransfers() : async [TransferTypes.Transfer] {
    TransferLib.getUserTransfers(transfers, caller);
  };

};
