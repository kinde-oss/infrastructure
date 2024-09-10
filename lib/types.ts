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
  timeout: number;
  retries: number;
  terminal: boolean;
};

export type onUserTokenEvent = {
  type: "onUserToken";
  data: {
    ipAddress: string;
    userAgent: string;
  };
};
