import Common "common";

module {
  public type User = {
    id : Common.UserId;
    var username : Text;
    var passwordHash : Text;
    role : Common.Role;
    var status : Common.UserStatus;
    var usdBalance : Float;
    createdAt : Common.Timestamp;
  };

  public type UserPublic = {
    id : Common.UserId;
    username : Text;
    role : Common.Role;
    status : Common.UserStatus;
    usdBalance : Float;
    createdAt : Common.Timestamp;
  };

  public type RegisterRequest = {
    username : Text;
    passwordHash : Text;
  };
};
