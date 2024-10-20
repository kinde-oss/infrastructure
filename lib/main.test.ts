import { describe, it, expect, vi } from "vitest";
import { idTokenCustomClaims, accessTokenCustomClaims } from "./main";
import { get } from "http";

global.kinde = {
  idToken: {
    getCustomClaims: vi.fn().mockReturnValue({  }),
    setCustomClaim: vi.fn(),
  },
  accessToken: {
    getCustomClaims: vi.fn().mockReturnValue({  }),
    setCustomClaim: vi.fn(),

  },
};

describe("ID Token", () => {
  it("should return a proxy object with IdToken properties", () => {
    const idTokenHandle = idTokenCustomClaims();
    expect(idTokenHandle).toHaveProperty("sub");
    expect(idTokenHandle.sub).toBe("123");
  });

  it("should not allow overriding of sub", () => {
    const idTokenHandle = idTokenCustomClaims();
    expect(() => {
      idTokenHandle.sub = "456";
    }).toThrowError("Access to sub is not allowed");
    expect(idTokenHandle.sub).toBe("123");
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
    expect(accessTokenHandle).toHaveProperty("sub");
    expect(accessTokenHandle.sub).toBe("654");
  });

  it("should not allow overriding of sub", () => {
    const accessTokenHandle = accessTokenCustomClaims();

    expect(() => {
      accessTokenHandle.sub = "456";
    }).toThrowError("Access to sub is not allowed");
    expect(accessTokenHandle.sub).toBe("654");
  });

  it("should allow setting of custom property", () => {
    const accessTokenHandle = idTokenCustomClaims<{ ipAddress: string }>();
    accessTokenHandle.ipAddress = "1.2.3.4";
    expect(accessTokenHandle.ipAddress).toBe("1.2.3.4");
  });
});
