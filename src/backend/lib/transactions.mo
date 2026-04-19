import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/transactions";
import UserTypes "../types/users";
import Common "../types/common";

module {
  // nextId is passed by reference via a mutable Nat held in a single-element List
  // Instead, we use the transactions list size as the next id.

  public func deposit(
    users : List.List<UserTypes.User>,
    transactions : List.List<Types.Transaction>,
    bonusRecipients : Set.Set<Common.UserId>,
    callerId : Common.UserId,
    amount : Float,
  ) : { #ok : Types.DepositResult; #err : Text } {
    if (amount <= 0.0) {
      return #err("Deposit amount must be greater than zero");
    };
    let userOpt = users.find(func(u : UserTypes.User) : Bool { u.id == callerId });
    switch (userOpt) {
      case null { #err("User not found") };
      case (?user) {
        // Apply deposit
        user.usdBalance := user.usdBalance + amount;

        // Record deposit transaction
        let depositTx : Types.Transaction = {
          id = transactions.size();
          userId = callerId;
          txType = #deposit;
          amount;
          description = "Deposit of $" # floatToText(amount);
          timestamp = Time.now();
        };
        transactions.add(depositTx);

        // Check bonus eligibility: amount >= 10.0 AND never received bonus before
        var bonusEarned : Float = 0.0;
        if (amount >= 10.0 and not bonusRecipients.contains(callerId)) {
          let bonus = 2.0;
          user.usdBalance := user.usdBalance + bonus;
          bonusRecipients.add(callerId);
          bonusEarned := bonus;

          // Record bonus transaction
          let bonusTx : Types.Transaction = {
            id = transactions.size();
            userId = callerId;
            txType = #bonus;
            amount = bonus;
            description = "Deposit bonus reward of $2.00";
            timestamp = Time.now();
          };
          transactions.add(bonusTx);
        };

        #ok({
          depositAmount = amount;
          bonusEarned;
          newBalance = user.usdBalance;
        });
      };
    };
  };

  public func getForUser(
    transactions : List.List<Types.Transaction>,
    userId : Common.UserId,
  ) : [Types.Transaction] {
    transactions.filter(func(tx : Types.Transaction) : Bool { tx.userId == userId }).toArray();
  };

  public func getAll(transactions : List.List<Types.Transaction>) : [Types.Transaction] {
    transactions.toArray();
  };

  func floatToText(f : Float) : Text {
    // Simple float-to-text via debug_show, trimmed
    debug_show(f);
  };
};
