import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/users";
import Common "../types/common";

module {
  public func register(
    users : List.List<Types.User>,
    id : Common.UserId,
    req : Types.RegisterRequest,
  ) : { #ok : Types.UserPublic; #err : Text } {
    // Check username already taken
    switch (users.find(func(u : Types.User) : Bool { u.username == req.username })) {
      case (?_) { return #err("Username already taken") };
      case null {};
    };
    // Check principal already registered
    switch (users.find(func(u : Types.User) : Bool { u.id == id })) {
      case (?_) { return #err("Already registered") };
      case null {};
    };
    let user : Types.User = {
      id;
      var username = req.username;
      var passwordHash = req.passwordHash;
      role = #customer;
      var status = #active;
      var usdBalance = 10_000.0;
      createdAt = Time.now();
    };
    users.add(user);
    #ok(toPublic(user));
  };

  public func getByPrincipal(
    users : List.List<Types.User>,
    id : Common.UserId,
  ) : ?Types.User {
    users.find(func(u : Types.User) : Bool { u.id == id });
  };

  public func toPublic(user : Types.User) : Types.UserPublic {
    {
      id = user.id;
      username = user.username;
      role = user.role;
      status = user.status;
      usdBalance = user.usdBalance;
      createdAt = user.createdAt;
    };
  };

  public func getAllPublic(users : List.List<Types.User>) : [Types.UserPublic] {
    users.map<Types.User, Types.UserPublic>(func(u) { toPublic(u) }).toArray();
  };

  public func adjustBalance(
    users : List.List<Types.User>,
    targetId : Common.UserId,
    newBalance : Float,
    callerRole : Common.Role,
  ) : { #ok; #err : Text } {
    switch (callerRole) {
      case (#admin) {};
      case (_) { return #err("Unauthorized") };
    };
    switch (users.find(func(u : Types.User) : Bool { u.id == targetId })) {
      case (?user) {
        user.usdBalance := newBalance;
        #ok;
      };
      case null { #err("User not found") };
    };
  };

  public func setStatus(
    users : List.List<Types.User>,
    targetId : Common.UserId,
    status : Common.UserStatus,
    callerRole : Common.Role,
  ) : { #ok; #err : Text } {
    switch (callerRole) {
      case (#admin) {};
      case (_) { return #err("Unauthorized") };
    };
    switch (users.find(func(u : Types.User) : Bool { u.id == targetId })) {
      case (?user) {
        user.status := status;
        #ok;
      };
      case null { #err("User not found") };
    };
  };
};
