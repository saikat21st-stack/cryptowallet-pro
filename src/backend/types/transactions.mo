import Common "common";

module {
  public type TxType = {
    #deposit;
    #bonus;
    #trade;
    #transfer;
  };

  public type Transaction = {
    id : Nat;
    userId : Common.UserId;
    txType : TxType;
    amount : Float;
    description : Text;
    timestamp : Common.Timestamp;
  };

  public type DepositResult = {
    depositAmount : Float;
    bonusEarned : Float;
    newBalance : Float;
  };
};
