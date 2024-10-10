type TokenCommon = {
  aud: Array<string>;
  azp: string;
  exp: number;
  iat: number;
  sub: string;
  iss: string;
  jti: string;
};

export type IdToken = TokenCommon & {
  at_hash: string;
  auth_time: number;
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  name: string;
  org_codes: Array<string>;
  picture: string;
  preferred_username: string;
  rat: number;
  updated_at: number;
};

export type AccessToken = TokenCommon & {
  feature_flags: Record<
    string,
    | {
        t: "b";
        v: boolean;
      }
    | {
        t: "n";
        v: number;
      }
    | {
        t: "s";
        v: string;
      }
  >;
  org_code: string;
  org_name: string;
  roles: Array<{
    id: string;
    key: string;
    name: string;
  }>;
  scp: Array<string>;
  user_properties: Record<
    string,
    {
      v: string;
    }
  >;
};

export type M2MToken = TokenCommon & {
  feature_flags: Record<
    string,
    | {
        t: "b";
        v: boolean;
      }
    | {
        t: "n";
        v: number;
      }
    | {
        t: "s";
        v: string;
      }
  >;
  org_code: string;
  org_name: string;
  scp: Array<string>;
};

export enum WorkflowResult {
  accept,
  deny,
}

type WorkflowAcceptResponse = {
  result: WorkflowResult.accept;
  message?: never;
};

type WorkflowDenyResponse = {
  result: WorkflowResult.deny;
  message: string;
};

export type WorkflowReponse = WorkflowAcceptResponse | WorkflowDenyResponse;

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
   * {number} timeout in milliseconds, default is 5000
   */
  timeout?: number;

  /**
   * {number} number of retries, default is 1
   */
  retries?: number;

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
    /**
     * Exposes the console methods to the workflow
     */
    console?: {};
    /**
     * Exposes the fetch method to call extenal APIs to the workflow
     */
    "kinde.fetch"?: {};
  };
};

export enum WorkflowTrigger {
  UserTokenGeneration = "user:tokens_generation",
  M2MTokenGeneration = "m2m:tokens_generation",
}

type EventBase = {
  request: {
    auth: {
      audience: string[];
    };
    ip: string;
  };
  context: {
    user: {};
    org: {};
    app: {
      clientId: string;
    };
  };
};

export type onUserTokenGeneratedEvent = EventBase & {
  trigger: WorkflowTrigger.UserTokenGeneration;
};

export type onM2MTokenGeneratedEvent = EventBase & {
  trigger: WorkflowTrigger.M2MTokenGeneration;
};
