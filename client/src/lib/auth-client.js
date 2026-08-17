import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }
  return "https://nabisfashion.vercel.app";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});
