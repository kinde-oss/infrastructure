export type IdToken = {
  at_hash: string;
  aud: Array<string>;
  auth_time: number;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  org_codes: Array<string>;
  picture: string;
  preferred_username: string;
  rat: number;
  sub: string;
  updated_at: number;
};

export type AccessToken = {
  sub: string;
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
   * {string} REQUIRED The unique identifier of the workflow
   */
  id: string;

  /**
   * {WorkflowTrigger} REQUIRED Workflow trigger
   */
  trigger: WorkflowTrigger;

  /**
   * {WorkflowTrigger} friendly free text description of the workflow
   */
  description?: "Check if the user is banned by IP address";

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
    'kinde.idToken'?: {

      /**
       * {boolean} reset all claims to default value on workflow start, default is false
       */
      resetClaims?: boolean;
    },
    /**
     * Exposes the access token to the workflow
     */
    'kinde.accessToken'?: {
       /**
       * {boolean} reset all claims to default value on workflow start, default is false
       */
      resetClaims?: boolean;
    },
    /**
     * Exposes the console methods to the workflow
     */
    'console'?: {},
    /**
     * Exposes the fetch method to call extenal APIs to the workflow
     */
    'kinde.fetch'?: {},    
  }
};

export enum WorkflowTrigger {
  UserTokenGenerated = "user:tokens_generated",
  M2MTokenGenerated = "m2m:tokens_generated",
}

export type onUserTokenGeneratedEvent = {
  type: "WorkflowTrigger.UserTokenGenerated";
  data: {
    ipAddress: string;
    userAgent: string;
  };
};

export type onM2MTokenGeneratedEvent = {
  type: WorkflowTrigger.M2MTokenGenerated;
  data: {
    ipAddress: string;
    userAgent: string;
  };
};
