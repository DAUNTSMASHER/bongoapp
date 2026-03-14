/**
 * Safe admin API fetch helper.
 * Handles non-JSON responses (e.g. 500 HTML) and returns structured result.
 */

export async function adminFetch(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(url, options);
    let data: Record<string, unknown> = {};
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = { error: "Invalid JSON response" };
      }
    } else {
      const text = await res.text();
      data = {
        error:
          res.status >= 400
            ? `Server error (${res.status}). Check FIREBASE_SERVICE_ACCOUNT in Vercel env vars.`
            : "Unexpected response",
      };
    }
    const error =
      typeof data?.error === "string"
        ? data.error
        : !res.ok
          ? `Request failed (${res.status})`
          : undefined;
    return { ok: res.ok, data, error };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      data: {},
      error: msg.includes("fetch") || msg.includes("network")
        ? "Network error. Check connection and try again."
        : msg,
    };
  }
}
