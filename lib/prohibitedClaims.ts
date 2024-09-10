export type CommonProhibitedClaims =
  | "azp"
  | "exp"
  | "iat"
  | "iss"
  | "nbf"
  | "sid"
  | "sub"
  | "act"
  | "aud"
  | "act";

export type KindeIdTokenProhibitedClaims =
  | CommonProhibitedClaims
  | "auth_time"
  | "jti"
  | "updated_at"
  | "rat";
export type KindeAccessTokenProhibitedClaims =
  | CommonProhibitedClaims
  | "jti"
  | "scp";
export type Kindem2mTokenProhibitedClaims =
  | CommonProhibitedClaims
  | "gty"
  | "jti"
  | "scp";
