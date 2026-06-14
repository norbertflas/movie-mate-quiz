import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client — replaces supabase.auth after the Cloudflare
 * migration. Same-origin (the Worker serves both SPA and /api/auth/*),
 * so no baseURL configuration is needed in production.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});

export const { useSession, signIn, signUp, signOut } = authClient;
