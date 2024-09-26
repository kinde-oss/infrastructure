import { describe, it, expect } from "vitest";
import { getKindeIdTokenHandle, getKindeAccessTokenHandle } from "./main";

global.kinde = {
  idToken: {
    value: {
      sub: "123",
    },
  },
  accessToken: {
    value: {
      sub: "654",
    },
  },
};

describe("ID Token", () => {
  it("should return a proxy object with IdToken properties", () => {
    const idTokenHandle = getKindeIdTokenHandle();
    expect(idTokenHandle).toHaveProperty("sub");
    expect(idTokenHandle.sub).toBe("123");
  });

  it("should not allow overriding of sub", () => {
    const idTokenHandle = getKindeIdTokenHandle();
    expect(() => {
      idTokenHandle.sub = "456";
    }).toThrowError("Access to sub is not allowed");
    expect(idTokenHandle.sub).toBe("123");
  });

  it("should allow setting of custom property", () => {
    const idTokenHandle = getKindeIdTokenHandle<{ ipAddress: string }>();
    idTokenHandle.ipAddress = "1.2.3.4";
    expect(idTokenHandle.ipAddress).toBe("1.2.3.4");
  });
});

describe("Access Token", () => {
  it("should return a proxy object with AccessToken properties", () => {
    const accessTokenHandle = getKindeAccessTokenHandle();
    expect(accessTokenHandle).toHaveProperty("sub");
    expect(accessTokenHandle.sub).toBe("654");
  });

  it("should not allow overriding of sub", () => {
    const accessTokenHandle = getKindeAccessTokenHandle();

    expect(() => {
      accessTokenHandle.sub = "456";
    }).toThrowError("Access to sub is not allowed");
    expect(accessTokenHandle.sub).toBe("654");
  });

  it("should allow setting of custom property", () => {
    const accessTokenHandle = getKindeIdTokenHandle<{ ipAddress: string }>();
    accessTokenHandle.ipAddress = "1.2.3.4";
    expect(accessTokenHandle.ipAddress).toBe("1.2.3.4");
  });
});
