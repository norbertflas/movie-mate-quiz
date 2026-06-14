/**
 * Resolve the user's real country from the Cloudflare edge once per load
 * and cache it (cf-region) for synchronous region detection.
 *
 * A manual choice (user-region) always wins, so we skip when it is set.
 * Best-effort and non-blocking: on a non-Cloudflare host or when offline
 * this silently no-ops and detection falls back to locale/timezone.
 */
export async function bootstrapRegion(): Promise<void> {
  try {
    if (localStorage.getItem("user-region")) return;

    const res = await fetch("/api/geo");
    if (!res.ok) return;

    const data = (await res.json()) as { country: string | null };
    if (data.country && /^[A-Z]{2}$/.test(data.country)) {
      localStorage.setItem("cf-region", data.country);
    }
  } catch {
    /* ignore — fall back to locale/timezone detection */
  }
}
