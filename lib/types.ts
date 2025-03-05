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
     * Exposes the fetch method to call external APIs to the workflow
     */
    "kinde.fetch"?: {};
    /**
     * Exposes the fetch method to call signed external APIs to the workflow
     */
    "kinde.secureFetch"?: {};
    /**
     * Exposes the fetch method to call access the manipulate the Kinde widget
     */
    "kinde.widget"?: {};
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
     * Required to change the MFA policy
     */
    "kinde.mfa": {};
    /**
     * Add URL tooling
     */
    url?: {};
  };
};

export enum WorkflowTrigger {
  UserTokenGeneration = "user:tokens_generation",
  UserPreMFA = "user:pre_mfa",
  PostAuthentication = "user:post_authentication",  
  M2MTokenGeneration = "m2m:token_generation",
  ExistingPasswordProvided = "user:existing_password_provided",
  NewPasswordProvided = "user:new_password_provided",
}

export type WorkflowEvents =
  | onUserTokenGeneratedEvent
  | onPostAuthenticationEvent
  | onM2MTokenGeneratedEvent
  | onExistingPasswordProvidedEvent
  | onNewPasswordProvidedEvent;

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
  userAgent: string;
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

export type onPostAuthenticationEvent = EventBase & {
  request: {
    auth: never;
    authUrlParams: LoginMethodParams & {
      state: string
    }
  },
  context: {
    workflow: {
      trigger: WorkflowTrigger.PostAuthentication;
    };
    user: {
      id: string;
    };
    auth: {
      connectionId: string;
      isNewUserRecordCreated: boolean;
    }
  }
}

export type onExistingPasswordProvidedEvent = EventBase & {
  request: {
    auth: never;
  }
  context: {
    auth: {
      password: string;
    };
    user: {
      id: string;
    };
    workflow: {
      trigger: WorkflowTrigger.ExistingPasswordProvided;
    };
  };
};

export type onNewPasswordProvidedEvent = EventBase & {
  request: {
    auth: never;
  }
  context: {
    auth: {
      firstPassword: string; // the first password entered
      secondPassword: string; // password match field
      newPasswordReason: "reset" | "initial"; // whether it is registration or reset
    };
    user: {
      id: string;
      email: string;
    };
    workflow: {
      trigger: WorkflowTrigger.NewPasswordProvided;
    };
  };
};

export type MFAPolicy = "required" | "optional" | "off";
export type MFAContext = "environment" | "organization";
export type MFAEnabledFactors =
  | "mfa:sms"
  | "mfa:email"
  | "mfa:authenticator_app";
export type MFAEnforcementPolicy = "required" | "skip";

export type onUserPreMFA = EventBase & {
  context: {
    auth: {
      connectionId: string;
    };
    mfa: {
      policy: MFAPolicy;
      context: MFAContext;
      enabled_factors: MFAEnabledFactors[];
      isUserRoleExempt: boolean;
      isUserConnectionExempt: boolean;
    };
    user: {
      id: string;
    };
    workflow: {
      trigger: WorkflowTrigger.UserPreMFA;
    };
    organization: {
      code: string;
    };
  };
};

export type onM2MTokenGeneratedEvent = EventBase & {
  request: {
    userAgent: never;
    auth: {
      scope: string[]
    }
  }
  context: {
    workflow: {
      trigger: WorkflowTrigger.M2MTokenGeneration;
    };
  };
};

export type KindeFetchOptions = {
  method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  responseFormat?: "json" | "text";
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
  orgCode: OrgCode;
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
  pageTitle: string;
  /** The main heading text for the page */
  heading: string;
  /** The description text for the page */
  description: string;
  /** Alternative text for the company logo */
  logoAlt: string;
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
};

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


type LoginMethodParams = Partial<
  Pick<
    LoginOptions,
    | "audience"
    | "scope"
    | "isCreateOrg"
    | "prompt"
    | "lang"
    | "loginHint"
    | "orgCode"
    | "orgName"
    | "connectionId"
    | "redirectURL"
    | "hasSuccessPage"
    | "workflowDeploymentId"
  >
>;

export enum Scopes {
  email = "email",
  profile = "profile",
  openid = "openid",
  offline_access = "offline",
}

export enum PromptTypes {
  none = "none",
  create = "create",
  login = "login",
}

export type LoginOptions = {
  /** Audience to include in the token */
  audience?: string;
  /** Client ID of the application
   *
   * This can be found in the application settings in the Kinde dashboard
   */
  clientId: string;
  /**
   * Code challenge for PKCE
   */
  codeChallenge?: string;
  /**
   * Code challenge method for PKCE
   */
  codeChallengeMethod?: string;
  /**
   * Connection ID to use for the login
   *
   * This is found in the authentication settings in the Kinde dashboard
   */
  connectionId?: string;
  /**
   * Whether the user is creating an organization on registration
   */
  isCreateOrg?: boolean;
  /**
   * Language to use for the login in 2 letter ISO format
   */
  lang?: string;
  /**
   * Login hint to use for the login
   *
   * This can be in one of the following formats:
   * - joe@blogs.com
   * - phone:+447700900000:gb
   * - username:joebloggs
   */
  loginHint?: string;
  /**
   * Organization code to use for the login
   */
  orgCode?: string;
  /**
   * Organization name to be used when creating an organization at registration
   */
  orgName?: string;
  /**
   * Prompt to use for the login
   *
   * This can be one of the following:
   * - login (force user re-authentication)
   * - create (show registration screen)
   * - none (silently authenticate user without prompting for action)
   *
   */
  prompt?: PromptTypes;
  /**
   * Redirect URL to use for the login
   */
  redirectURL: string;
  /**
   * Response type to use for the login
   *
   * Kinde currently only supports `code`
   */
  responseType?: string;
  /**
   * Scopes to include in the token
   *
   * This can be one or more of the following:
   * - email
   * - profile
   * - openid
   * - offline
   */
  scope?: Scopes[];
  /**
   * State to use for the login
   */
  state?: string;
  /**
   * Whether to show the success screen at the end of the flow, this is most useful when the callback is not a webpage.
   */
  hasSuccessPage?: boolean;
  /**
   * Single use code to prevent replay attacks
   */
  nonce?: string;
  /**
   * Workflow Deployment ID to trigger on authentication
   */
  workflowDeploymentId?: string;
};