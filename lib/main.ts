export * from "./types";
import {
  KindeIdTokenProhibitedClaims,
  KindeAccessTokenProhibitedClaims,
  Kindem2mTokenProhibitedClaims,
} from "./prohibitedClaims.ts";
import { KindeAPIRequest, KindeFetchOptions, WorkflowEvents } from "./types";
import { version as packageVersion } from "../package.json";

export const version = packageVersion;

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace kinde {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function fetch(url: string, options: unknown): Promise<any>;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace env {
    export function get(key: string): { value: string; isSecret: boolean };
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace idToken {
    export function setCustomClaim(key: string, value: unknown): void;
    export function getCustomClaims(): unknown;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace accessToken {
    export function setCustomClaim(key: string, value: unknown): void;
    export function getCustomClaims(): unknown;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace m2mToken {
    export function setCustomClaim(key: string, value: unknown): void;
    export function getCustomClaims(): unknown;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace auth {
    export function denyAccess(reason: string): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace risk {
    export function setScore(score: number): void;
    export function getScore(): number;
  }
}

const idTokenClaimsHandler: ProxyHandler<Record<string, unknown>> = {
  get(
    target: Record<string, unknown>,
    prop: string,
    value: ProxyHandler<Record<string, unknown>>,
  ) {
    return Reflect.get(target, prop.toString(), value);
  },
  set(
    target: Record<string, unknown>,
    prop: string,
    value: ProxyHandler<Record<string, unknown>>,
  ) {
    kinde.idToken.setCustomClaim(prop, value);
    return Reflect.set(target, prop, value);
  },
};

const accessTokenClaimsHandler = {
  get(
    target: Record<string, unknown>,
    prop: string,
    value: ProxyHandler<Record<string, unknown>>,
  ) {
    return Reflect.get(target, prop.toString(), value);
  },
  set(
    target: Record<string, unknown>,
    prop: string,
    value: ProxyHandler<Record<string, unknown>>,
  ) {
    kinde.accessToken.setCustomClaim(prop, value);
    return Reflect.set(target, prop, value);
  },
};

const m2mTokenClaimsHandler = {
  get(
    target: Record<string, unknown>,
    prop: string,
    value: ProxyHandler<Record<string, unknown>>,
  ) {
    return Reflect.get(target, prop.toString(), value);
  },
  set(
    target: Record<string, unknown>,
    prop: string,
    value: ProxyHandler<Record<string, unknown>>,
  ) {
    kinde.m2mToken.setCustomClaim(prop, value);
    return Reflect.set(target, prop, value);
  },
};

/**
 * Returns mutatable ID Token object
 */
export function idTokenCustomClaims<T extends object>(): Omit<
  T,
  KindeIdTokenProhibitedClaims
> {
  if (!kinde.idToken) {
    throw new Error(
      "IdToken binding not available, please add to workflow settings to enable",
    );
  }
  const claims = kinde.idToken.getCustomClaims() as Omit<
    T,
    KindeIdTokenProhibitedClaims
  >;
  return new Proxy<Omit<T, KindeIdTokenProhibitedClaims>>(
    claims,
    idTokenClaimsHandler,
  );
}

/**
 * Returns mutatable access token object
 */
export function accessTokenCustomClaims<T extends object>(): Omit<
  T,
  KindeAccessTokenProhibitedClaims
> {
  if (!kinde.accessToken) {
    throw new Error(
      "accessToken binding not available, please add to workflow settings to enable",
    );
  }
  const claims = kinde.accessToken.getCustomClaims() as Omit<
    T,
    KindeAccessTokenProhibitedClaims
  >;
  return new Proxy<Omit<T, KindeAccessTokenProhibitedClaims>>(
    claims,
    accessTokenClaimsHandler,
  );
}

/**
 * Returns mutatable M2M token object
 */
export function m2mTokenClaims<T extends object>(): Omit<
  T,
  Kindem2mTokenProhibitedClaims
> {
  if (!kinde.m2mToken) {
    throw new Error(
      "m2mToken binding not available, please add to workflow settings to enable",
    );
  }
  const claims = kinde.m2mToken.getCustomClaims() as Omit<
    T,
    Kindem2mTokenProhibitedClaims
  >;
  return new Proxy<Omit<T, Kindem2mTokenProhibitedClaims>>(
    claims,
    m2mTokenClaimsHandler,
  );
}

/**
 * Gets the environment variable from the Kinde buisness dashboard
 * @param key
 */

export function getEnvironmentVariable<T = string>(
  key: T,
): { value: string; isSecret: boolean } {
  if (!kinde.env) {
    throw new Error(
      "env binding not available, please add to workflow settings to enable",
    );
  }

  return kinde.env.get(key as string);
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

/**
 * Fetch data from an external API
 * @param reason Reason for denying access
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetch<T = any>(
  url: string,
  options: KindeFetchOptions,
): Promise<T> {
  if (!kinde.fetch) {
    throw new Error("fetch binding not available");
  }

  if (!options.responseFormat) {
    options.responseFormat = "json";
  }

  const result = await kinde.fetch(url, options);

  return {
    data: result?.json,
  } as T;
}

type createKindeAPIOptions =
  | {
      clientId: string;
      clientSecret: string;
      clientIdKey: never;
      clientSecretKey: never;
    }
  | {
      clientIdKey: string;
      clientSecretKey: string;
      clientId: never;
      clientSecret: never;
    };

/**
 * create a Kinde API client
 * @param baseURL Base URL of the Kinde API
 * @returns Kinde API client
 */
export async function createKindeAPI(
  event: WorkflowEvents,
  options?: createKindeAPIOptions,
) {
  let clientId: string;
  let clientSecret: string;

  if (!URLSearchParams) {
    throw new Error("url binding not available");
  }

  if (options?.clientId && options?.clientSecret) {
    clientId = options.clientId;
    clientSecret = options.clientSecret;
  } else if (options?.clientIdKey && options?.clientSecretKey) {
    clientId = getEnvironmentVariable(options.clientIdKey)?.value;
    clientSecret = getEnvironmentVariable(options.clientSecretKey)?.value;
  } else {
    clientId = getEnvironmentVariable("KINDE_WF_M2M_CLIENT_ID")?.value;
    clientSecret = getEnvironmentVariable("KINDE_WF_M2M_CLIENT_SECRET")?.value;
    if (!clientId) {
      throw new Error("M2M client ID not set");
    }
    if (!clientSecret) {
      throw new Error("M2M client secret not set");
    }
  }

  const { data: token } = await fetch(
    `${event.context.domains.kindeDomain}/oauth2/token`,
    {
      method: "POST",
      responseFormat: "json",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        audience: `${event.context.domains.kindeDomain}/api`,
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );

  const callKindeAPI = async ({
    method,
    endpoint,
    params,
    contentType = "application/json",
  }: KindeAPIRequest) => {
    const result = await kinde.fetch(
      `${event.context.domains.kindeDomain}/api/v1/${endpoint}`,
      {
        method,
        responseFormat: "json",
        headers: {
          authorization: `Bearer ${token.access_token}`,
          "Content-Type": contentType,
          accept: "application/json",
        },
        body: params && new URLSearchParams(params),
      },
    );

    return { data: result.json };
  };

  return {
    get: async (params: Omit<KindeAPIRequest, "method">) =>
      await callKindeAPI({ method: "GET", ...params }),
    post: async (params: Omit<KindeAPIRequest, "method">) =>
      await callKindeAPI({ method: "POST", ...params }),
    patch: async (params: Omit<KindeAPIRequest, "method">) =>
      await callKindeAPI({ method: "PATCH", ...params }),
    put: async (params: Omit<KindeAPIRequest, "method">) =>
      await callKindeAPI({ method: "PUT", ...params }),
    delete: async (params: Omit<KindeAPIRequest, "method">) =>
      await callKindeAPI({ method: "DELETE", ...params }),
  };
}
