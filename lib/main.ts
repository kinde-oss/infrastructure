export * from "./types";
import {
  KindeIdTokenProhibitedClaims,
  KindeAccessTokenProhibitedClaims,
  Kindem2mTokenProhibitedClaims,
} from "./prohibitedClaims.ts";
import {
  createKindeAPIOptions,
  KindeAPIRequest,
  KindeDesignerCustomProperties,
  KindeFetchOptions,
  MFAEnforcementPolicy,
  OrgCode,
  WorkflowEvents,
} from "./types";
import { version as packageVersion } from "../package.json";

export const version = packageVersion;
type KindePlaceholder = `@${string}@`;

const getAssetUrl = (assetPath: string, orgCode?: OrgCode) => {
  if (!assetPath || assetPath.includes("..")) {
    throw new Error("Invalid asset path");
  }
  return `/${assetPath}?${orgCode ? `p_org_code=${orgCode}&` : ""}cache=@8973ff883c2c40e1bad198b543e12b24@`;
};

type ValidationKeyJWKS = {
  type: "jwks";
  jwks: {
    url: string;
  };
};

type ValidationKeyStatic = {
  type: "static";
  static: {
    alg: "HS256";
    key: string;
  };
};

type ValidationKey = { key: ValidationKeyJWKS | ValidationKeyStatic };

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace kinde {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function fetch(url: string, options: unknown): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function secureFetch(url: string, options: unknown): Promise<any>;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace env {
    export function get(key: string): { value: string; isSecret: boolean };
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace widget {
    export function invalidateFormField(
      fieldName: string,
      message: string,
    ): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace localization {
    export function get(key: string): string;
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
  namespace mfa {
    export function setEnforcementPolicy(
      mfaEnforcementPolicy: MFAEnforcementPolicy,
    ): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace risk {
    export function setScore(score: number): void;
    export function getScore(): number;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace plan {
    export function denySelection(message: string, reasons?: string[]): void;
    export function denyCancellation(reason: string): number;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace cache {
    export function jwtToken(
      tokenName: string,
      options?: {
        validation?: ValidationKey;
        onMissingOrExpired?: () => string;
      },
    ): Promise<string>;
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
      "IdToken binding not available, please add to workflow/page settings to enable",
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
      "accessToken binding not available, please add to workflow/page settings to enable",
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
      "m2mToken binding not available, please add to workflow/page settings to enable",
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
      "env binding not available, please add to workflow/page settings to enable",
    );
  }

  return kinde.env.get(key as string);
}

/**
 * Gets the environment variable from the Kinde buisness dashboard
 * @param key
 */
export function getLocalization(key: string): string {
  if (!kinde.localization) {
    throw new Error(
      "localization binding not available, please add to workflow/page settings to enable",
    );
  }

  return kinde.localization.get(key);
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
 * Invalidate a Kinde widget form field
 * @param fieldName Name of the field to invalidate
 * @param message Reason for invalidating the field
 */
export function invalidateFormField(fieldName: string, message: string) {
  if (!kinde.widget) {
    throw new Error("widget binding not available");
  }
  kinde.widget.invalidateFormField(fieldName, message);
}

/**
 * Fetch data from an external API
 * @param url URL of the API
 * @param options Fetch options
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
    data:
      options.responseFormat === "json"
        ? result?.json
        : (result.text as string),
  } as T;
}

/**
 * Set the MFA enforcement policy for the user
 * @param policy MFA Policy to enforce
 */
export function setEnforcementPolicy(policy: MFAEnforcementPolicy) {
  if (!kinde.mfa) {
    throw new Error(
      "mfa binding not available, please add to workflow settings to enable",
    );
  }
  kinde.mfa.setEnforcementPolicy(policy);
}

/**
 * Fetch data from a secure external API
 *
 * Encryption keys can be setup in the Kinde dashboard under workflows > encryption keys
 * @param url URL of the API
 * @param options Fetch options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function secureFetch<T = any>(
  url: string,
  options: KindeFetchOptions,
): Promise<T> {
  if (!kinde.secureFetch) {
    throw new Error("secureFetch binding not available");
  }

  if (!options.responseFormat) {
    options.responseFormat = "json";
  }

  const result = await kinde.secureFetch(url, options);

  return {
    data: result?.json,
  } as T;
}

export type getM2MTokenOptions = {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string[];
  scopes?: string[];
  headers?: Record<string, string>;
  skipCache?: boolean;
};

export async function getM2MToken<T = string>(
  tokenName: T,
  options: getM2MTokenOptions,
) {
  const fetchToken = () => {
    if (!options.domain || !options.clientId || !options.clientSecret) {
      throw new Error("getM2MToken: Missing required parameters");
    }

    try {
      const result = kinde.fetch(`${options.domain}/oauth2/token`, {
        method: "POST",
        responseFormat: "json",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
          ...options.headers,
        },
        body: new URLSearchParams({
          audience: options.audience?.join(" ") ?? "",
          grant_type: "client_credentials",
          client_id: options.clientId,
          client_secret: options.clientSecret,
          scope: options.scopes?.join(" ") ?? "",
        }),
      }) as { json: { access_token: string } };

      if (!result.json?.access_token) {
        throw new Error("getM2MToken: No access token returned");
      }

      return result.json.access_token;
    } catch (error) {
      throw new Error(
        `getM2MToken: Failed to obtain token - ${(error as Error).message}`,
      );
    }
  };

  // If skipCache is true, directly fetch the token without using cache
  if (options.skipCache) {
    return fetchToken();
  }

  // Otherwise, use the cache with onMissingOrExpired callback
  return await kinde.cache.jwtToken(tokenName as string, {
    validation: {
      key: {
        type: "jwks",
        jwks: {
          url: `${options.domain}/.well-known/jwks.json`,
        },
      },
    },
    onMissingOrExpired: fetchToken,
  });
}

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

  const apiVersion = 1;

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

  let token = await getM2MToken("internal_m2m_access_token", {
    domain: event.context.domains.kindeDomain,
    clientId,
    clientSecret,
    audience: [`${event.context.domains.kindeDomain}/api`],
    skipCache: options?.skipCache ?? false,
  });

  if (typeof token === "object") {
    token = JSON.stringify(token);
    token = token.replace(`"\\"`, "");
    token = token.replace(`\\""`, "");
  }
  token = token.replace(/"/g, "");

  const callKindeAPI = async ({
    method,
    endpoint,
    params,
    contentType = "application/json",
  }: KindeAPIRequest) => {
    let body;
    if (params) {
      body = method === "GET" ? new URLSearchParams(params).toString() : params;
    }

    const result = await kinde.fetch(
      `${event.context.domains.kindeDomain}/api/v${apiVersion}/${endpoint}`,
      {
        method,
        responseFormat: "json",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": contentType,
          accept: "application/json",
        },
        body: body ?? undefined,
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

const registerGUID = "@b1d3a51558e64036ad072b56ebae37f5@";
const loginGUID = "@847681e125384709836f921deb311104@";

/**
 *
 * @returns Kinde placeholder for the main page content
 */
export const getKindeWidget = (): KindePlaceholder =>
  "@cd65da2987c740d58961024aa4a27194@";

/**
 *
 * @returns Kinde placeholder for the nonce
 */
export const getKindeNonce = (): KindePlaceholder =>
  "@43dffdf2c22f40e9981303cb383f6fac@";

/**
 *
 * @returns Kinde placeholder for the required CSS
 */
export const getKindeRequiredCSS = (): KindePlaceholder =>
  "@ce0ef44d50f6408985f00c04a85d8430@";

/**
 *
 * @returns Kinde placeholder for the required JS
 */
export const getKindeRequiredJS = (): KindePlaceholder =>
  "@8103c7ff23fe49edb9b0537d2927e74e@";

/**
 *
 * @returns Kinde placeholder for the CSRF token
 */
export const getKindeCSRF = (): KindePlaceholder =>
  "@0c654432670c4d0292c3a0bc3c533247@";

/**
 *
 * @returns Register URL Placeholder
 */
export const getKindeRegisterUrl = (): KindePlaceholder => registerGUID;

/**
 *
 * @returns Login URL Placeholder
 */
export const getKindeLoginUrl = (): KindePlaceholder => loginGUID;

/**
 *
 * @returns Register URL Placeholder
 */
export const getKindeSignUpUrl = (): KindePlaceholder => registerGUID;

/**
 *
 * @returns Login URL Placeholder
 */
export const getKindeSignInUrl = (): KindePlaceholder => loginGUID;

/**
 *
 * @returns Theme code Placeholder
 */
export const getKindeThemeCode = (): KindePlaceholder =>
  "@09e41b34d7c04650aee6d26cafa152fc@";

/**
 *
 * @returns Light Mode Logo Placeholder
 */
export const getLogoUrl = (orgCode?: OrgCode) => {
  return getAssetUrl("logo", orgCode);
};

/**
 *
 * @returns Dark Mode Logo Placeholder
 */
export const getDarkModeLogoUrl = (orgCode?: OrgCode) => {
  return getAssetUrl("logo_dark", orgCode);
};

/**
 *
 * @returns SVG FavIcon Placeholder
 */
export const getSVGFaviconUrl = (orgCode?: OrgCode) => {
  return getAssetUrl("favicon_svg", orgCode);
};

/**
 *
 * @returns Fallback FavIcon Placeholder
 */
export const getFallbackFaviconUrl = (orgCode?: OrgCode) => {
  return getAssetUrl("favicon_fallback", orgCode);
};

const isValidColor = (color: string | undefined) =>
  !color ||
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(.*\)$|^rgba\(.*\)$/.test(color);
const isValidBorderRadius = (radius: string | undefined) =>
  !radius || /^(0|\d+(.(\d)+)?(%|px|rem|em))$/.test(radius);

const coloursValid = (...colors: (string | undefined)[]) =>
  colors.every(isValidColor) || undefined;
const borderRadiusValid = (...radii: (string | undefined)[]) =>
  radii.every(isValidBorderRadius) || undefined;

/**
 * Sets custom properties for the Kinde Designer.
 *
 * @param {KindeDesignerCustomProperties} params - The parameters for setting custom properties.
 * @param {string} params.baseBackgroundColor - The base background color.
 * @param {string} params.baseLinkColor - The base link color.
 * @param {string} params.buttonBorderRadius - The border radius for buttons.
 * @param {string} params.primaryButtonBackgroundColor - The background color for primary buttons.
 * @param {string} params.primaryButtonColor - The color for primary buttons.
 * @param {string} params.cardBorderRadius - The border radius for cards.
 * @param {string} params.inputBorderRadius - The border radius for input fields.
 * @returns {string} A string of CSS custom properties
 */
export const setKindeDesignerCustomProperties = ({
  baseBackgroundColor,
  baseLinkColor,
  buttonBorderRadius,
  primaryButtonBackgroundColor,
  primaryButtonColor,
  cardBorderRadius,
  inputBorderRadius,
}: KindeDesignerCustomProperties): string => {
  if (
    !coloursValid(
      baseBackgroundColor,
      baseLinkColor,
      primaryButtonBackgroundColor,
      primaryButtonColor,
    )
  ) {
    console.log("baseBackgroundColor: ", baseBackgroundColor);
    console.log("baseLinkColor: ", baseLinkColor);
    console.log("primaryButtonBackgroundColor: ", primaryButtonBackgroundColor);
    console.log("primaryButtonColor: ", primaryButtonColor);
    throw new Error("Invalid color value provided");
  }
  if (
    !borderRadiusValid(buttonBorderRadius, cardBorderRadius, inputBorderRadius)
  ) {
    console.log("buttonBorderRadius: ", buttonBorderRadius);
    console.log("cardBorderRadius: ", cardBorderRadius);
    console.log("inputBorderRadius: ", inputBorderRadius);
    throw new Error("Invalid border radius value provided");
  }

  return [
    baseBackgroundColor &&
      `--kinde-designer-base-background-color: ${baseBackgroundColor};`,
    baseLinkColor && `--kinde-designer-base-link-color: ${baseLinkColor};`,
    cardBorderRadius &&
      `--kinde-designer-card-border-radius: ${cardBorderRadius};`,
    buttonBorderRadius &&
      `--kinde-designer-button-border-radius: ${buttonBorderRadius};`,
    inputBorderRadius &&
      `--kinde-designer-control-select-text-border-radius: ${inputBorderRadius};`,
    primaryButtonBackgroundColor &&
      `--kinde-designer-button-primary-background-color: ${primaryButtonBackgroundColor};`,
    primaryButtonColor &&
      `--kinde-designer-button-primary-color: ${primaryButtonColor};`,
  ]
    .filter(Boolean)
    .join("\n");
};

/**
 *
 * Deny the plan selection for the user
 * @param message Message to display to the user when denying plan selection
 * @param reasons Array of reasons for denying the plan selection
 */
export const denyPlanSelection = (
  message: string,
  reasons?: string[],
): void => {
  if (!kinde.plan) {
    throw new Error(
      "plan binding not available, please add to workflow/page settings to enable",
    );
  }

  if (!message || typeof message !== "string") {
    throw new Error("Invalid message provided");
  }

  kinde.plan.denySelection(message, reasons);
};

/**
 *
 * Deny the plan cancellation for the user
 * @param reason Message to display to the user when denying plan cancellation
 */
export const denyPlanCancellation = (reason: string): void => {
  if (!kinde.plan) {
    throw new Error(
      "plan binding not available, please add to workflow/page settings to enable",
    );
  }

  if (!reason || typeof reason !== "string") {
    throw new Error("Invalid message provided");
  }

  kinde.plan.denyCancellation(reason);
};
