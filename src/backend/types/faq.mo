import Common "common";

module {
  public type FaqEntry = {
    id : Nat;
    var question : Text;
    var answer : Text;
    var category : Text;
    createdAt : Common.Timestamp;
  };

  public type FaqEntryPublic = {
    id : Nat;
    question : Text;
    answer : Text;
    category : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateFaqRequest = {
    question : Text;
    answer : Text;
    category : Text;
  };

  public type UpdateFaqRequest = {
    id : Nat;
    question : Text;
    answer : Text;
    category : Text;
  };
};
