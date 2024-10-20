export * from "./types";
import { KindeIdTokenProhibitedClaims, KindeAccessTokenProhibitedClaims, Kindem2mTokenProhibitedClaims } from "./prohibitedClaims.ts";

declare namespace kinde {
  export function fetch(url: string, options: unknown): Promise<any>;

  namespace env {
    export function get(key: string): string;
  }

  namespace idToken {
    export function setCustomClaim(key: string, value: unknown): void;
    export function getCustomClaims(): unknown;
  }
  namespace accessToken {
    export function setCustomClaim(key: string, value: unknown): void;
    export function getCustomClaims(): unknown;
  }
  namespace m2mToken {
    export function setCustomClaim(key: string, value: unknown): void;
    export function getCustomClaims(): unknown;
  }

  namespace auth {
    export function denyAccess(reason: string): void;
  }

  namespace risk {
    export function setScore(score: number): void;
    export function getScore(): number;
  }
}

const idTokenClaimsHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    kinde.idToken.setCustomClaim(prop, receiver);
    return Reflect.set(target, prop, receiver);
  },
};

const accessTokenClaimsHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    kinde.accessToken.setCustomClaim(prop, receiver);
    return Reflect.set(target, prop, receiver);
  },
};

const m2mTokenClaimsHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    kinde.idToken.setCustomClaim(prop, receiver);
    return Reflect.set(target, prop, receiver);
  },
};

/**
 * Returns mutatable ID Token object
 */
export function idTokenCustomClaims<T extends object>(): Omit<T, KindeIdTokenProhibitedClaims> {
  const claims = kinde.idToken.getCustomClaims() as Omit<T, KindeIdTokenProhibitedClaims>;
  return new Proxy<Omit<T, KindeIdTokenProhibitedClaims>>(claims, idTokenClaimsHandler);
}

/**
 * Returns mutatable access token object
 */
export function accessTokenCustomClaims<T extends object>(): Omit<T, KindeAccessTokenProhibitedClaims> {
  const claims = kinde.accessToken.getCustomClaims() as Omit<T, KindeAccessTokenProhibitedClaims>;
  return new Proxy<Omit<T, KindeAccessTokenProhibitedClaims>>(claims, accessTokenClaimsHandler);
}

/**
 * Returns mutatable M2M token object
 */
export function m2mTokenClaims<T extends object>(): Omit<T, Kindem2mTokenProhibitedClaims> { 
  const claims = kinde.accessToken.getCustomClaims() as Omit<T, Kindem2mTokenProhibitedClaims>;
  return new Proxy<Omit<T, Kindem2mTokenProhibitedClaims>>(claims, m2mTokenClaimsHandler);
}

/**
 * Gets the environment variable from the Kinde buisness dashboard
 * @param key 
 */
export function getEnvironmentVariable<T = string>(key: T): string {
  return kinde.env.get(key as string);
}

/**
 * Deny access to the user
 * @param reason Reason for denying access
 */
export function denyAccess(reason: string) {
  kinde.auth.denyAccess(reason);
}