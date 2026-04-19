import List "mo:core/List";
import FaqTypes "../types/faq";
import UserTypes "../types/users";
import Common "../types/common";
import FaqLib "../lib/faq";
import UserLib "../lib/users";

mixin (
  users : List.List<UserTypes.User>,
  faqs : List.List<FaqTypes.FaqEntry>,
) {
  var nextFaqId : Nat = faqs.size();

  public query func getAllFaq() : async [FaqTypes.FaqEntryPublic] {
    FaqLib.getAll(faqs);
  };

  public shared ({ caller }) func createFaq(req : FaqTypes.CreateFaqRequest) : async { #ok : FaqTypes.FaqEntryPublic; #err : Text } {
    let role = getFaqCallerRole(caller);
    let result = FaqLib.create(faqs, nextFaqId, req, role);
    switch (result) {
      case (#ok(_)) { nextFaqId += 1 };
      case (#err(_)) {};
    };
    result;
  };

  public shared ({ caller }) func updateFaq(req : FaqTypes.UpdateFaqRequest) : async { #ok; #err : Text } {
    FaqLib.update(faqs, req, getFaqCallerRole(caller));
  };

  public shared ({ caller }) func deleteFaq(id : Nat) : async { #ok; #err : Text } {
    FaqLib.delete(faqs, id, getFaqCallerRole(caller));
  };

  func getFaqCallerRole(caller : Principal) : Common.Role {
    switch (UserLib.getByPrincipal(users, caller)) {
      case (?user) { user.role };
      case null { #customer };
    };
  };

};
