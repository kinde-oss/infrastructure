import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  idTokenCustomClaims,
  accessTokenCustomClaims,
  getEnvironmentVariable,
  createKindeAPI,
  WorkflowEvents,
  WorkflowTrigger,
  getKindeWidget,
  getKindeNonce,
  getKindeRequiredCSS,
  getKindeRequiredJS,
  getKindeCSRF,
  getKindeLoginUrl,
  getKindeRegisterUrl,
  getKindeSignInUrl,
  getKindeSignUpUrl,
  getKindeThemeCode,
  setKindeDesignerCustomProperties,
  getDarkModeLogoUrl,
  getLogoUrl,
  getFallbackFaviconUrl,
  getSVGFaviconUrl,
  getLocalization,
  denyAccess,
  m2mTokenClaims,
  invalidateFormField,
  setEnforcementPolicy,
  secureFetch,
  denyPlanSelection,
  denyPlanCancellation,
  getM2MToken,
} from "./main";

global.kinde = {
  idToken: {
    getCustomClaims: vi.fn().mockReturnValue({}),
    setCustomClaim: vi.fn(),
  },
  m2mToken: {
    getCustomClaims: vi.fn().mockReturnValue({}),
    setCustomClaim: vi.fn(),
  },
  accessToken: {
    getCustomClaims: vi.fn().mockReturnValue({}),
    setCustomClaim: vi.fn(),
  },
  env: {
    get: vi.fn().mockReturnValue({
      value: "123",
      isSecret: false,
    }),
  },
  widget: {
    invalidateFormField: vi.fn(),
  },
  mfa: {
    setEnforcementPolicy: vi.fn(),
  },
  fetch: vi.fn(),
  secureFetch: vi.fn().mockResolvedValue({}),
  localization: {
    get: vi.fn().mockReturnValue({
      value: "123",
      isSecret: false,
    }),
  },
  auth: {
    denyAccess: vi.fn(),
  },
  plan: {
    denySelection: vi.fn(),
    denyCancellation: vi.fn(),
  },
  cache: {
    jwtToken: vi.fn(),
  },
};

const mockEvent: WorkflowEvents = {
  request: {
    ip: "1.2.3.4",
    auth: {
      audience: ["https://api.example.com/v1"],
    },
  },
  context: {
    auth: {
      origin: "refresh_token_request",
      connectionId: "conn_0192b...",
      isExistingSession: false,
    },
    user: {
      id: "kp_6a071...",
      identityId: "identity_0192c...",
    },
    domains: {
      kindeDomain: "https://mykindebusiness.kinde.com",
    },
    workflow: {
      trigger: WorkflowTrigger.UserTokenGeneration,
    },
    application: {
      clientId: "f77dbc...",
    },
    organization: {
      code: "org_b5a9c8...",
    },
  },
};

describe("ID Token", () => {
  it("should return a proxy object with get and set methods", () => {
    const idTokenHandle = idTokenCustomClaims<{ test: string }>();
    expect(idTokenHandle).toStrictEqual({});

    idTokenHandle.test = "10";

    expect(global.kinde.idToken.setCustomClaim).toHaveBeenCalledWith(
      "test",
      "10",
    );

    expect(idTokenHandle.test).toBe("10");
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.idToken;
    delete global.kinde.idToken;
    expect(() => idTokenCustomClaims()).toThrowError(
      "IdToken binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.idToken = backup;
  });
});

describe("Access Token", () => {
  it("should return a proxy object with get and set methods", () => {
    const accessTokenHandle = accessTokenCustomClaims<{ test: string }>();
    expect(accessTokenHandle).toStrictEqual({});

    accessTokenHandle.test = "10";

    expect(global.kinde.accessToken.setCustomClaim).toHaveBeenCalledWith(
      "test",
      "10",
    );

    expect(accessTokenHandle.test).toBe("10");
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.accessToken;
    delete global.kinde.accessToken;
    expect(() => accessTokenCustomClaims()).toThrowError(
      "accessToken binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.accessToken = backup;
  });
});

describe("M2M Token", () => {
  it("should return a proxy object with get and set methods", () => {
    const m2mTokenHandle = m2mTokenClaims<{ test: string }>();
    expect(m2mTokenHandle).toStrictEqual({});

    m2mTokenHandle.test = "10";

    expect(global.kinde.m2mToken.setCustomClaim).toHaveBeenCalledWith(
      "test",
      "10",
    );

    expect(m2mTokenHandle.test).toBe("10");
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.m2mToken;
    delete global.kinde.m2mToken;
    expect(() => m2mTokenClaims()).toThrowError(
      "m2mToken binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.m2mToken = backup;
  });
});

describe("getM2MToken", () => {
  const mockOptions = {
    domain: "https://test.kinde.com",
    clientId: "test_client_id",
    clientSecret: "test_client_secret",
    audience: ["https://api.test.com"],
    scopes: ["read", "write"],
    headers: { "custom-header": "value" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch token with caching when skipCache is false", async () => {
    global.kinde.cache.jwtToken.mockResolvedValueOnce("cached_token");

    const result = await getM2MToken("test_token", mockOptions);

    expect(result).toBe("cached_token");
    expect(global.kinde.cache.jwtToken).toHaveBeenCalledWith("test_token", {
      validation: {
        key: {
          type: "jwks",
          jwks: {
            url: "https://test.kinde.com/.well-known/jwks.json",
          },
        },
      },
      onMissingOrExpired: expect.any(Function),
    });
  });

  it("should fetch token without caching when skipCache is true", async () => {
    global.kinde.fetch.mockReturnValueOnce({
      json: { access_token: "fresh_token" },
    });

    const result = await getM2MToken("test_token", {
      ...mockOptions,
      skipCache: true,
    });

    expect(result).toBe("fresh_token");
    expect(global.kinde.cache.jwtToken).not.toHaveBeenCalled();
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://test.kinde.com/oauth2/token",
      {
        method: "POST",
        responseFormat: "json",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
          "custom-header": "value",
        },
        body: expect.any(URLSearchParams),
      },
    );
  });

  it("should fetch token without caching when skipCache is undefined", async () => {
    global.kinde.cache.jwtToken.mockResolvedValueOnce("cached_token");

    const result = await getM2MToken("test_token", mockOptions);

    expect(result).toBe("cached_token");
    expect(global.kinde.cache.jwtToken).toHaveBeenCalled();
  });

  it("should include all parameters in the token request", async () => {
    global.kinde.fetch.mockReturnValueOnce({
      json: { access_token: "fresh_token" },
    });

    await getM2MToken("test_token", { ...mockOptions, skipCache: true });

    const fetchCall = global.kinde.fetch.mock.calls[0];
    const body = fetchCall[1].body as URLSearchParams;

    expect(body.get("audience")).toBe("https://api.test.com");
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("client_id")).toBe("test_client_id");
    expect(body.get("client_secret")).toBe("test_client_secret");
    expect(body.get("scope")).toBe("read write");
  });

  it("should handle missing optional parameters", async () => {
    global.kinde.fetch.mockReturnValueOnce({
      json: { access_token: "fresh_token" },
    });

    const minimalOptions = {
      domain: "https://test.kinde.com",
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      audience: ["https://api.test.com"],
    };

    await getM2MToken("test_token", { ...minimalOptions, skipCache: true });

    const fetchCall = global.kinde.fetch.mock.calls[0];
    const body = fetchCall[1].body as URLSearchParams;

    expect(body.get("audience")).toBe("https://api.test.com");
    expect(body.get("scope")).toBe("");
  });

  it("should throw error when required parameters are missing", async () => {
    const invalidOptions = {
      domain: "",
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      audience: ["https://api.test.com"],
    };

    await expect(
      getM2MToken("test_token", { ...invalidOptions, skipCache: true }),
    ).rejects.toThrow("getM2MToken: Missing required parameters");
  });

  it("should throw error when token response is invalid", async () => {
    global.kinde.fetch.mockReturnValueOnce({
      json: { invalid_field: "value" },
    });

    await expect(
      getM2MToken("test_token", { ...mockOptions, skipCache: true }),
    ).rejects.toThrow("getM2MToken: No access token returned");
  });

  it("should throw error when fetch fails", async () => {
    global.kinde.fetch.mockImplementationOnce(() => {
      throw new Error("Network error");
    });

    await expect(
      getM2MToken("test_token", { ...mockOptions, skipCache: true }),
    ).rejects.toThrow("getM2MToken: Failed to obtain token - Network error");
  });

  it("should handle onMissingOrExpired callback when using cache", async () => {
    global.kinde.fetch.mockReturnValueOnce({
      json: { access_token: "fresh_token" },
    });
    global.kinde.cache.jwtToken.mockImplementationOnce((tokenName, options) => {
      // Simulate cache miss by calling onMissingOrExpired
      return Promise.resolve(options.onMissingOrExpired());
    });

    const result = await getM2MToken("test_token", mockOptions);

    expect(result).toBe("fresh_token");
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://test.kinde.com/oauth2/token",
      {
        method: "POST",
        responseFormat: "json",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
          "custom-header": "value",
        },
        body: expect.any(URLSearchParams),
      },
    );
  });
});

describe("createKindeAPI", () => {
  it("should return the value of the environment variable", async () => {
    global.kinde.fetch.mockReset();
    global.kinde.fetch.mockResolvedValueOnce({
      json: { access_token: "access_token" },
    });
    global.kinde.cache.jwtToken.mockResolvedValueOnce("access_token");
    const env = await createKindeAPI(mockEvent);
    expect(env).toStrictEqual({
      delete: expect.any(Function),
      get: expect.any(Function),
      patch: expect.any(Function),
      post: expect.any(Function),
      put: expect.any(Function),
    });
  });

  it("PUT", async () => {
    global.kinde.fetch.mockReset();
    global.kinde.fetch.mockResolvedValueOnce({
      json: { access_token: "access_token" },
    });
    global.kinde.cache.jwtToken.mockResolvedValueOnce("access_token");

    const env = await createKindeAPI(mockEvent);
    global.kinde.fetch.mockResolvedValueOnce({
      json: {},
    });
    env.put({
      endpoint: "users",
      params: { name: "test" },
    });
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://mykindebusiness.kinde.com/api/v1/users",
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: "Bearer access_token",
        },
        body: { name: "test" },
        method: "PUT",
        responseFormat: "json",
      },
    );
  });

  it("GET", async () => {
    global.kinde.fetch.mockReset();
    global.kinde.fetch.mockResolvedValueOnce({
      json: { access_token: "access_token" },
    });
    global.kinde.cache.jwtToken.mockResolvedValueOnce("access_token");

    const env = await createKindeAPI(mockEvent);
    global.kinde.fetch.mockResolvedValueOnce({
      json: {},
    });
    env.get({
      endpoint: "users",
      params: { name: "test" },
    });
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://mykindebusiness.kinde.com/api/v1/users",
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: "Bearer access_token",
        },
        body: "name=test",
        method: "GET",
        responseFormat: "json",
      },
    );
  });

  it("PATCH", async () => {
    global.kinde.fetch.mockReset();
    global.kinde.fetch.mockResolvedValueOnce({
      json: { access_token: "access_token" },
    });
    global.kinde.cache.jwtToken.mockResolvedValueOnce("access_token");

    const env = await createKindeAPI(mockEvent);
    global.kinde.fetch.mockResolvedValueOnce({
      json: {},
    });
    env.patch({
      endpoint: "users",
      params: { name: "test" },
    });
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://mykindebusiness.kinde.com/api/v1/users",
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: "Bearer access_token",
        },
        body: {
          name: "test",
        },
        method: "PATCH",
        responseFormat: "json",
      },
    );
  });

  it("POST", async () => {
    global.kinde.fetch.mockReset();
    global.kinde.fetch.mockResolvedValueOnce({
      json: { access_token: "access_token" },
    });
    global.kinde.cache.jwtToken.mockResolvedValueOnce("access_token");

    const env = await createKindeAPI(mockEvent);
    global.kinde.fetch.mockResolvedValueOnce({
      json: {},
    });
    env.post({
      endpoint: "users",
      params: { name: "test" },
    });
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://mykindebusiness.kinde.com/api/v1/users",
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: "Bearer access_token",
        },
        body: {
          name: "test",
        },
        method: "POST",
        responseFormat: "json",
      },
    );
  });

  it("DELETE", async () => {
    global.kinde.fetch.mockReset();
    global.kinde.fetch.mockResolvedValueOnce({
      json: { access_token: "access_token" },
    });
    global.kinde.cache.jwtToken.mockResolvedValueOnce("access_token");

    const env = await createKindeAPI(mockEvent);
    global.kinde.fetch.mockResolvedValueOnce({
      json: {},
    });
    env.delete({
      endpoint: "users",
    });
    expect(global.kinde.fetch).toHaveBeenCalledWith(
      "https://mykindebusiness.kinde.com/api/v1/users",
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authorization: "Bearer access_token",
        },
        method: "DELETE",
        responseFormat: "json",
      },
    );
  });

  describe("Error handling", () => {
    it("Missing client ID", () => {
      global.kinde.env.get.mockReturnValueOnce(undefined);
      expect(
        async () => await createKindeAPI({ ...mockEvent, context: {} }),
      ).rejects.toThrowError("M2M client ID not set");
    });
    it("Missing client Secret", () => {
      global.kinde.env.get.mockReturnValueOnce({ value: "test" });
      global.kinde.env.get.mockReturnValueOnce(undefined);
      expect(
        async () => await createKindeAPI({ ...mockEvent, context: {} }),
      ).rejects.toThrowError("M2M client secret not set");
    });
  });
});

const colorProperties = [
  {
    name: "baseBackgroundColor",
    attribute: "--kinde-designer-base-background-color",
  },
  {
    name: "baseLinkColor",
    attribute: "--kinde-designer-base-link-color",
  },
  {
    name: "primaryButtonBackgroundColor",
    attribute: "--kinde-designer-button-primary-background-color",
  },
  {
    name: "primaryButtonColor",
    attribute: "--kinde-designer-button-primary-color",
  },
];
const radiusProperties = [
  {
    name: "buttonBorderRadius",
    attribute: "--kinde-designer-button-border-radius",
  },
  {
    name: "cardBorderRadius",
    attribute: "--kinde-designer-card-border-radius",
  },
  {
    name: "inputBorderRadius",
    attribute: "--kinde-designer-control-select-text-border-radius",
  },
];
const validColors = ["#000000", "#000", "rgb(1,1,1)", "rgba(1,1,1,1)"];
const invalidColors = ["0", "1px", "1em", "1rem"];
const validBorderRadius = ["0", "1px", "1em", "1rem"];
const invalidBorderRadius = ["#000000", "3", "test"];
describe("setKindeDesignerCustomProperties", () => {
  colorProperties.forEach((property) => {
    it(property.name, () => {
      validColors.forEach((value) => {
        const accessTokenHandle = setKindeDesignerCustomProperties({
          [property.name]: value,
        });
        expect(accessTokenHandle).toEqual(`${property.attribute}: ${value};`);
      });
    });
  });

  radiusProperties.forEach((property) => {
    it(property.name, () => {
      validBorderRadius.forEach((value) => {
        const accessTokenHandle = setKindeDesignerCustomProperties({
          [property.name]: value,
        });
        expect(accessTokenHandle).toEqual(`${property.attribute}: ${value};`);
      });
    });
  });

  colorProperties.forEach((property) => {
    it(`${property.name} - Invalid values`, () => {
      vi.spyOn(console, "log");

      invalidColors.forEach((value) => {
        expect(() =>
          setKindeDesignerCustomProperties({
            [property.name]: value,
          }),
        ).toThrowError("Invalid color value provided");
      });
      expect(console.log).toHaveBeenCalledWith(`${property.name}: `, "1rem");
    });
  });

  radiusProperties.forEach((property) => {
    it(`${property.name} - Invalid values`, () => {
      vi.spyOn(console, "log");

      invalidBorderRadius.forEach((value) => {
        expect(() =>
          setKindeDesignerCustomProperties({
            [property.name]: value,
          }),
        ).toThrowError("Invalid border radius value provided");
      });
      expect(console.log).toHaveBeenCalledWith(`${property.name}: `, "#000000");
    });
  });
});

describe("GUID helpers", () => {
  it("getKindeWidget returns correct GUID", () => {
    const accessTokenHandle = getKindeWidget();
    expect(accessTokenHandle).toEqual("@cd65da2987c740d58961024aa4a27194@");
  });

  it("getKindeNonce returns correct GUID", () => {
    const accessTokenHandle = getKindeNonce();
    expect(accessTokenHandle).toEqual("@43dffdf2c22f40e9981303cb383f6fac@");
  });

  it("getKindeRequiredCSS returns correct GUID", () => {
    const accessTokenHandle = getKindeRequiredCSS();
    expect(accessTokenHandle).toEqual("@ce0ef44d50f6408985f00c04a85d8430@");
  });

  it("getKindeRequiredJS returns correct GUID", () => {
    const accessTokenHandle = getKindeRequiredJS();
    expect(accessTokenHandle).toEqual("@8103c7ff23fe49edb9b0537d2927e74e@");
  });

  it("getKindeCSRF returns correct GUID", () => {
    const accessTokenHandle = getKindeCSRF();
    expect(accessTokenHandle).toEqual("@0c654432670c4d0292c3a0bc3c533247@");
  });

  it("getKindeRegisterUrl returns correct GUID", () => {
    const accessTokenHandle = getKindeRegisterUrl();
    expect(accessTokenHandle).toEqual("@b1d3a51558e64036ad072b56ebae37f5@");
  });

  it("getKindeSignUpUrl returns correct GUID", () => {
    const accessTokenHandle = getKindeSignUpUrl();
    expect(accessTokenHandle).toEqual("@b1d3a51558e64036ad072b56ebae37f5@");
  });

  it("getKindeLoginUrl returns correct GUID", () => {
    const accessTokenHandle = getKindeLoginUrl();
    expect(accessTokenHandle).toEqual("@847681e125384709836f921deb311104@");
  });

  it("getKindeSignInUrl returns correct GUID", () => {
    const accessTokenHandle = getKindeSignInUrl();
    expect(accessTokenHandle).toEqual("@847681e125384709836f921deb311104@");
  });

  it("getKindeThemeCode returns correct GUID", () => {
    const accessTokenHandle = getKindeThemeCode();
    expect(accessTokenHandle).toEqual("@09e41b34d7c04650aee6d26cafa152fc@");
  });
});

describe("URL helpers", () => {
  it("getDarkModeLogoUrl returns correct Url", () => {
    const accessTokenHandle = getDarkModeLogoUrl("org_1234");
    expect(accessTokenHandle).toEqual(
      "/logo_dark?p_org_code=org_1234&cache=@8973ff883c2c40e1bad198b543e12b24@",
    );
  });

  it("getLogoUrl returns correct Url", () => {
    const accessTokenHandle = getLogoUrl("org_1234");
    expect(accessTokenHandle).toEqual(
      "/logo?p_org_code=org_1234&cache=@8973ff883c2c40e1bad198b543e12b24@",
    );
  });

  it("getSVGFaviconUrl returns correct Url", () => {
    const accessTokenHandle = getSVGFaviconUrl("org_1234");
    expect(accessTokenHandle).toEqual(
      "/favicon_svg?p_org_code=org_1234&cache=@8973ff883c2c40e1bad198b543e12b24@",
    );
  });

  it("getFallbackFaviconUrl returns correct Url", () => {
    const accessTokenHandle = getFallbackFaviconUrl("org_1234");
    expect(accessTokenHandle).toEqual(
      "/favicon_fallback?p_org_code=org_1234&cache=@8973ff883c2c40e1bad198b543e12b24@",
    );
  });
});

describe("getLocalization", () => {
  it("should return the localization", async () => {
    getLocalization("test");
    expect(global.kinde.localization.get).toHaveBeenCalledWith("test");
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.localization;
    delete global.kinde.localization;
    expect(() => getLocalization("test")).toThrowError(
      "localization binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.localization = backup;
  });
});

describe("denyAccess", () => {
  it("should call denyAccess", async () => {
    denyAccess("test");
    expect(global.kinde.auth.denyAccess).toHaveBeenCalledWith("test");
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.auth;
    delete global.kinde.auth;
    expect(() => denyAccess("test")).toThrowError("auth binding not available");
    global.kinde.auth = backup;
  });
});

describe("getEnvironmentVariable", () => {
  it("should return the results from kinde environment", async () => {
    const env = getEnvironmentVariable("test");
    expect(global.kinde.env.get).toHaveBeenCalledWith("test");
    expect(env).toStrictEqual({
      isSecret: false,
      value: "123",
    });
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.env;
    delete global.kinde.env;
    expect(() => getEnvironmentVariable("test")).toThrowError(
      "env binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.env = backup;
  });
});

describe("invalidateFormField", () => {
  it("should return the results from kinde environment", async () => {
    invalidateFormField("test", "message");
    expect(global.kinde.widget.invalidateFormField).toHaveBeenCalledWith(
      "test",
      "message",
    );
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.widget;
    delete global.kinde.widget;
    expect(() => invalidateFormField("test", "message")).toThrowError(
      "widget binding not available",
    );
    global.kinde.widget = backup;
  });
});

describe("setEnforcementPolicy", () => {
  it("should return the results from kinde environment", async () => {
    setEnforcementPolicy("required");
    expect(global.kinde.mfa.setEnforcementPolicy).toHaveBeenCalledWith(
      "required",
    );
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.mfa;
    delete global.kinde.mfa;
    expect(() => setEnforcementPolicy("required")).toThrowError(
      "mfa binding not available, please add to workflow settings to enable",
    );
    global.kinde.mfa = backup;
  });
});

describe("secureFetch", () => {
  it("should return the results from kinde environment", async () => {
    secureFetch("required", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(global.kinde.secureFetch).toHaveBeenCalledWith("required", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      responseFormat: "json",
    });
  });

  it("should error when binding missing", async () => {
    const backup = global.kinde.secureFetch;
    delete global.kinde.secureFetch;
    expect(async () => await secureFetch("required", {})).rejects.toThrowError(
      "secureFetch binding not available",
    );
    global.kinde.secureFetch = backup;
  });
});

describe("denySelection", () => {
  it("Errors on missing kinde.plan", async () => {
    const backup = global.kinde.plan;
    delete global.kinde.plan;
    expect(() => denyPlanSelection("required", [])).toThrowError(
      "plan binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.plan = backup;
  });

  it("Errors on invalid message", async () => {
    expect(() => denyPlanSelection(1, [])).toThrowError(
      "Invalid message provided",
    );
  });

  it("should pass params to internal methods", async () => {
    denyPlanSelection("test", ["message"]);
    expect(global.kinde.plan.denySelection).toHaveBeenCalledWith("test", [
      "message",
    ]);
  });
});

describe("denyPlanCancellation", () => {
  it("Errors on missing kinde.plan", async () => {
    const backup = global.kinde.plan;
    delete global.kinde.plan;
    expect(() => denyPlanCancellation("required")).toThrowError(
      "plan binding not available, please add to workflow/page settings to enable",
    );
    global.kinde.plan = backup;
  });

  it("Errors on invalid message", async () => {
    expect(() => denyPlanCancellation()).toThrowError(
      "Invalid message provided",
    );
  });

  it("should pass params to internal methods", async () => {
    denyPlanCancellation("test");
    expect(global.kinde.plan.denyCancellation).toHaveBeenCalledWith("test");
  });
});
