import { HexclaveClientApp } from "@hexclave/next";

export const hexclaveClientApp = new HexclaveClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    default: { type: "hosted" },
    signIn: { type: "custom", url: "/sign-in", version: 0 },
    signUp: { type: "custom", url: "/sign-up", version: 0 },
    accountSettings: { type: "custom", url: "/account-settings", version: 1 },
    afterSignIn: "/",
    afterSignUp: "/",
    afterSignOut: "/",
    home: "/",
  },
});
