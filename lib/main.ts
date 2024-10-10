import { IdToken, AccessToken, M2MToken } from "./types";
export * from "./types";

const commonProhibitedClaims = [
  "azp",
  "exp",
  "iat",
  "iss",
  "nbf",
  "sid",
  "sub",
  "act",
  "iss",
  "sid",
  "aud",
];
const KindeIdTokenProhibitedClaims = [
  ...commonProhibitedClaims,
  "auth_time,jti,updated_at,rat",
];
const KindeAccessTokenProhibitedClaims = [
  ...commonProhibitedClaims,
  "jti",
  "scp",
];
const Kindem2mTokenProhibitedClaims = [
  ...commonProhibitedClaims,
  "gty",
  "gty",
  "jti",
  "scp",
];

const idTokenProxyHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    if (KindeIdTokenProhibitedClaims.includes(prop.toString())) {
      throw new Error(`Access to ${prop.toString()} is not allowed`);
    }
    return Reflect.set(target, prop, receiver);
  },
};

const accessTokenProxyHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    if (KindeAccessTokenProhibitedClaims.includes(prop.toString())) {
      throw new Error(`Access to ${prop.toString()} is not allowed`);
    }
    return Reflect.set(target, prop, receiver);
  },
};

const m2mTokenProxyHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    if (Kindem2mTokenProhibitedClaims.includes(prop.toString())) {
      throw new Error(`Access to ${prop.toString()} is not allowed`);
    }
    return Reflect.set(target, prop, receiver);
  },
};

/**
 * Returns mutatable ID Token object
 */
export function getKindeIdTokenHandle<T>(): T & IdToken {
  return new Proxy<T & IdToken>(
    //@ts-expect-error This is injected at runtime
    kinde.idToken.value,
    idTokenProxyHandler,
  );
}

/**
 * Returns mutatable access token object
 */
export function getKindeAccessTokenHandle<T>(): T & AccessToken {
  return new Proxy<T & AccessToken>(
    //@ts-expect-error This is injected at runtime
    kinde.accessToken.value,
    accessTokenProxyHandler,
  );
}

/**
 * Returns mutatable M2M token object
 */
export function getKindeM2MTokenHandle<T>(): T & M2MToken {
  return new Proxy<T & AccessToken>(
    //@ts-expect-error This is injected at runtime
    kinde.m2mToken.value,
    m2mTokenProxyHandler,
  );
}
