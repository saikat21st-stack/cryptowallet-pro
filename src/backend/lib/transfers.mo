import List "mo:core/List";
import Time "mo:core/Time";
import TransferTypes "../types/transfers";
import PortfolioTypes "../types/portfolio";
import Common "../types/common";
import PortfolioLib "portfolio";

module {
  public func sendCrypto(
    transfers : List.List<TransferTypes.Transfer>,
    holdings : List.List<PortfolioTypes.Holding>,
    nextId : Nat,
    userId : Common.UserId,
    req : TransferTypes.SendCryptoRequest,
  ) : TransferTypes.SendCryptoResult {
    if (req.amount <= 0.0) {
      return #err("Amount must be positive");
    };
    if (req.toAddress == "") {
      return #err("Destination address is required");
    };
    let holding = PortfolioLib.getOrCreateHolding(holdings, userId, req.symbol);
    if (holding.quantity < req.amount) {
      return #err("Insufficient crypto balance");
    };
    holding.quantity -= req.amount;

    let transfer : TransferTypes.Transfer = {
      id = nextId;
      userId;
      symbol = req.symbol;
      amount = req.amount;
      toAddress = req.toAddress;
      status = #completed;
      timestamp = Time.now();
    };
    transfers.add(transfer);
    #ok(transfer);
  };

  public func getUserTransfers(
    transfers : List.List<TransferTypes.Transfer>,
    userId : Common.UserId,
  ) : [TransferTypes.Transfer] {
    transfers.filter(func(t : TransferTypes.Transfer) : Bool { t.userId == userId }).toArray();
  };
};
