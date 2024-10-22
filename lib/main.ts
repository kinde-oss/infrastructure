export * from "./types";
import { KindeIdTokenProhibitedClaims, KindeAccessTokenProhibitedClaims, Kindem2mTokenProhibitedClaims } from "./prohibitedClaims.ts";

declare namespace kinde {
  export function fetch(url: string, options: unknown): Promise<any>;

  namespace env {
    export function get(key: string): { value: string, isSecret: boolean };
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
  if (!kinde.idToken) {
    throw new Error("IdToken binding not available, please add to workflow settings to enable");
  }
  const claims = kinde.idToken.getCustomClaims() as Omit<T, KindeIdTokenProhibitedClaims>;
  return new Proxy<Omit<T, KindeIdTokenProhibitedClaims>>(claims, idTokenClaimsHandler);
}

/**
 * Returns mutatable access token object
 */
export function accessTokenCustomClaims<T extends object>(): Omit<T, KindeAccessTokenProhibitedClaims> {
  if (!kinde.accessToken) {
    throw new Error("accessToken binding not available, please add to workflow settings to enable");
  }
  const claims = kinde.accessToken.getCustomClaims() as Omit<T, KindeAccessTokenProhibitedClaims>;
  return new Proxy<Omit<T, KindeAccessTokenProhibitedClaims>>(claims, accessTokenClaimsHandler);
}

/**
 * Returns mutatable M2M token object
 */
export function m2mTokenClaims<T extends object>(): Omit<T, Kindem2mTokenProhibitedClaims> { 
  if (!kinde.m2mToken) {
    throw new Error("m2mToken binding not available, please add to workflow settings to enable");
  }
  const claims = kinde.m2mToken.getCustomClaims() as Omit<T, Kindem2mTokenProhibitedClaims>;
  return new Proxy<Omit<T, Kindem2mTokenProhibitedClaims>>(claims, m2mTokenClaimsHandler);
}

/**
 * Gets the environment variable from the Kinde buisness dashboard
 * @param key 
 */

export function getEnvironmentVariable<T = string>(key: T): { value: string, isSecret: boolean } {
  if (!kinde.env) {
    throw new Error("env binding not available, please add to workflow settings to enable");
  }

  return kinde.env.get(key as string)
}

/**
 * Deny access to the user
 * @param reason Reason for denying access
 */
export function denyAccess(reason: string) {
  if (!kinde.auth) {
    throw new Error("auth binding not available");
  }
  kinde.auth.denyAccess(reason);
}