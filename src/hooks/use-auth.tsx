import { authClient } from "@/lib/auth-client";

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/**
 * Auth hook backed by Better Auth (Cloudflare Worker + D1), replacing
 * the previous Supabase auth. Keeps the `{ session }` shape so existing
 * consumers that read `session?.user?.id` keep working.
 */
export const useAuth = () => {
  const { data, isPending } = authClient.useSession();

  const user: AppUser | null = data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        image: data.user.image ?? null,
      }
    : null;

  const session = user ? { user } : null;

  return { session, user, isLoading: isPending };
};
