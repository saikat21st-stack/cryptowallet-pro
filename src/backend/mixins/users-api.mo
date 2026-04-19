import List "mo:core/List";
import Set "mo:core/Set";
import UserTypes "../types/users";
import TxTypes "../types/transactions";
import Common "../types/common";
import UserLib "../lib/users";
import TxLib "../lib/transactions";

mixin (
  users : List.List<UserTypes.User>,
  transactions : List.List<TxTypes.Transaction>,
  bonusRecipients : Set.Set<Common.UserId>,
) {

  public shared ({ caller }) func register(req : UserTypes.RegisterRequest) : async { #ok : UserTypes.UserPublic; #err : Text } {
    UserLib.register(users, caller, req);
  };

  public query ({ caller }) func getMyProfile() : async ?UserTypes.UserPublic {
    switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) { ?UserLib.toPublic(user) };
      case null { null };
    };
  };

  public shared ({ caller }) func deposit(amount : Float) : async { #ok : TxTypes.DepositResult; #err : Text } {
    TxLib.deposit(users, transactions, bonusRecipients, caller, amount);
  };

  public query ({ caller }) func getMyTransactionHistory() : async [TxTypes.Transaction] {
    TxLib.getForUser(transactions, caller);
  };

};
