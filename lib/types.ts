/* eslint-disable @typescript-eslint/no-empty-object-type */
export type WorkflowSettings = {
  /**
   * {string} id The unique identifier of the workflow
   */
  id: string;

  /**
   * {WorkflowTrigger} trigger Workflow trigger
   */
  trigger: WorkflowTrigger;

  /**
   * {string} [name] friendly name the workflow
   */
  name?: string;

  /**
   * {string} [failurePolicy] failure policy for the workflow, stop is default
   */
  failurePolicy?: {
    action: "stop" | "continue";
  };

  bindings?: {
    /**
     * Exposes the id token to the workflow
     */
    "kinde.idToken"?: {
      /**
       * {boolean} reset all claims to default value on workflow start, default is false
       */
      resetClaims?: boolean;
    };
    /**
     * Exposes the access token to the workflow
     */
    "kinde.accessToken"?: {
      /**
       * {boolean} reset all claims to default value on workflow start, default is false
       */
      resetClaims?: boolean;
    };
    "kinde.m2mToken"?: {
      /**
       * {boolean} reset all claims to default value on workflow start, default is false
       */
      resetClaims?: boolean;
    };
    /**
     * Exposes the console methods to the workflow
     */
    console?: {};
    /**
     * Exposes the fetch method to call extenal APIs to the workflow
     */
    "kinde.fetch"?: {};
    /**
     * Exposes access to the kinde environment variables
     */
    "kinde.env"?: {};
    /**
     * Exposes access to the kinde environment variables
     */
    "kinde.auth"?: {};
    /**
     * Exposes access to the kinde localization
     */
    "kinde.localization": {};
    /**
     * Add URL tooling
     */
    url?: {};
  };
};

export enum WorkflowTrigger {
  UserTokenGeneration = "user:tokens_generation",
  M2MTokenGeneration = "m2m:token_generation",
}

export type WorkflowEvents =
  | onUserTokenGeneratedEvent
  | onM2MTokenGeneratedEvent;

type EventBase = {
  request: RequestContext;
  context: {
    domains: {
      kindeDomain: string;
    };
    application: {
      clientId: string;
    };
  };
};

type RequestContext = {
  auth: {
    audience: string[];
  };
  ip: string;
};

export type onUserTokenGeneratedEvent = EventBase & {
  context: {
    auth: {
      origin: string;
      connectionId: string;
      isExistingSession: boolean;
    };
    user: {
      id: string;
      identityId: string;
    };
    workflow: {
      trigger: WorkflowTrigger.UserTokenGeneration;
    };
    organization: {
      code: string;
    };
  };
};

export type onM2MTokenGeneratedEvent = EventBase & {
  context: {
    workflow: {
      trigger: WorkflowTrigger.M2MTokenGeneration;
    };
  };
};

export type KindeFetchOptions = {
  method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  responseFormat?: "json";
  headers: Record<string, string>;
  body?: URLSearchParams;
};

export type KindeAPIRequest = {
  method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  params?: Record<string, string>;
  contentType?: "application/json" | "application/x-www-form-urlencoded";
};

/**
 * Represents the authentication URL parameters received in the request
 */
interface AuthUrlParams {
  /** The requested organization code (e.g., 'org_12345') */
  orgCode: string;
  /** The state parameter used in the OAuth flow */
  state: string;
  /** The client_id query parameter identifying the application */
  clientId: string;
  /** The redirect_uri query parameter specifying where to return after auth */
  redirectUri: string;
}

/**
 * Contains localization information for the page
 */
interface Locale {
  /** Indicates if the content should be rendered right-to-left */
  isRtl: boolean;
  /** The language code for the requested content */
  lang: string;
}

/**
 * Contains routing information for the current request
 */
interface Route {
  /** The requested widget context (e.g., 'register' or 'choose_organization') */
  context: string;
  /** The type of authentication flow ('register' or 'login') */
  flow: "register" | "login";
  /** The current path of the request ('auth', 'account', or '/') */
  path: "auth" | "account" | "/";
}

/**
 * Contains the content and metadata for the page
 */
interface WidgetContent {
  /** The page title displayed in the browser tab */
  page_title: string;
  /** The main heading text for the page */
  heading: string;
  /** The description text for the page */
  description: string;
  /** Alternative text for the company logo */
  logo_alt: string;
}

/**
 * Contains widget-specific data and content
 */
interface Widget {
  /** The content object containing page text and metadata */
  content: WidgetContent;
}

/**
 * The context object containing page state and content
 */
interface KindePageContext {
  /** Widget-specific data and generated content */
  widget: Widget;
}

/**
 * The request object containing information about the current request
 */
interface KindePageRequest {
  /** Parameters extracted from the authorization URL */
  authUrlParams: AuthUrlParams;
  /** Localization settings for the page */
  locale: Locale;
  /** Current route information */
  route: Route;
}

/**
 * The main page event object passed to the page component
 */
export type KindePageEvent = {
  /** Contains page state and content information */
  context: KindePageContext;
  /** Contains information about the current request */
  request: KindePageRequest;
}
export type KindeDesignerCustomProperties = {
  baseBackgroundColor?: string;
  baseLinkColor?: string;
  buttonBorderRadius?: string;
  primaryButtonBackgroundColor?: string;
  primaryButtonColor?: string;
  cardBorderRadius?: string;
  inputBorderRadius?: string;
};

export type OrgCode = `org_${string}`;

export type createKindeAPIOptions =
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
