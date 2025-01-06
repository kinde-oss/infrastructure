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
