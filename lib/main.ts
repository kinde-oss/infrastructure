import { IdToken, AccessToken } from "./types";
export * from "./types";

const claimDenyList = [
  "sub",
  "at_hash",
  "aud",
  "auth_time",
  "azp",
  "email",
  "email_verified",
  "exp",
  "iat",
  "iss",
  "jti",
  "rat",
  "updated_at",
];

const tokenProxyHandler = {
  get(target: any, prop: string, receiver: any) {
    return Reflect.get(target, prop.toString(), receiver);
  },
  set(target: any, prop: string, receiver: any) {
    if (claimDenyList.includes(prop.toString())) {
      throw new Error(`Access to ${prop.toString} is not allowed`);
    }
    return Reflect.set(target, prop, receiver);
  },
};

export function getKindeIdTokenHandle<T>(): T & IdToken {
  return new Proxy<T & IdToken>(
    //@ts-expect-error This is injected at runtime
    kinde.idToken.value,
    tokenProxyHandler,
  );
}

export function getKindeAccessTokenHandle<T>(): T & AccessToken {
  //@ts-expect-error This is injected at runtime
  return new Proxy<T & AccessToken>(kinde.accessToken.value, tokenProxyHandler);
}
