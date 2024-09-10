import { describe, it, expect, vi } from "vitest";
import {
  idTokenCustomClaims,
  accessTokenCustomClaims,
  getEnvironmentVariable,
  createKindeAPI,
  WorkflowEvents,
} from "./main";

global.kinde = {
  idToken: {
    getCustomClaims: vi.fn().mockReturnValue({ name: "John Doe" }),
    setCustomClaim: vi.fn(),
  },
  accessToken: {
    getCustomClaims: vi.fn().mockReturnValue({ name: "John Doe" }),
    setCustomClaim: vi.fn(),
  },
  env: {
    get: vi.fn().mockReturnValue({
      value: "123",
      isSecret: false,
    }),
  },
  fetch: vi.fn().mockResolvedValue({}),
};

describe("ID Token", () => {
  it("should return a proxy object with IdToken properties", () => {
    const idTokenHandle = idTokenCustomClaims();
    expect(idTokenHandle).not.toHaveProperty("sub");
    expect(idTokenHandle).toHaveProperty("name");
  });

  it("should allow setting of custom property", () => {
    const idTokenHandle = idTokenCustomClaims<{ ipAddress: string }>();
    idTokenHandle.ipAddress = "1.2.3.4";
    expect(idTokenHandle.ipAddress).toBe("1.2.3.4");
  });
});

describe("Access Token", () => {
  it("should return a proxy object with AccessToken properties", () => {
    const accessTokenHandle = accessTokenCustomClaims();
    expect(accessTokenHandle).not.toHaveProperty("sub");
    expect(accessTokenHandle).toHaveProperty("name");
  });

  it("should allow setting of custom property", () => {
    const accessTokenHandle = idTokenCustomClaims<{ ipAddress: string }>();
    accessTokenHandle.ipAddress = "1.2.3.4";
    expect(accessTokenHandle.ipAddress).toBe("1.2.3.4");
  });
});

describe("getEnvironmentVariable", () => {
  it("should return the value of the environment variable", () => {
    const env = getEnvironmentVariable("API_KEY");
    expect(env).toStrictEqual({
      isSecret: false,
      value: "123",
    });
  });
});

describe("createKindeAPI", () => {
  it("should return the value of the environment variable", async () => {
    const env = await createKindeAPI("API_KEY" as WorkflowEvents, {
      method: "GET",
    });
    expect(env).toStrictEqual({
      delete: expect.any(Function),
      get: expect.any(Function),
      post: expect.any(Function),
      put: expect.any(Function),
    });
  });
});
