import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchStreamingData, buildResult, type StreamingOption } from "./streaming";

const KEYS = { tmdbApiKey: "test-key" };

/** Minimal Response-like stub for the worker's fetch usage. */
function res(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function mockFetch(handler: (url: string) => Response | Promise<Response>) {
  globalThis.fetch = vi.fn((input: any) => Promise.resolve(handler(String(input)))) as unknown as typeof fetch;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildResult", () => {
  it("separates subscription/free from rent/buy and sorts best-first", () => {
    const options: StreamingOption[] = [
      { service: "Apple TV", serviceLogo: "", link: "", type: "rent", quality: "HD" },
      { service: "Netflix", serviceLogo: "", link: "", type: "subscription", quality: "HD" },
      { service: "YouTube", serviceLogo: "", link: "", type: "buy", quality: "HD" },
    ];
    const r = buildResult(1, "X", options, "tmdb");
    expect(r.availableServices).toEqual(["Netflix"]);
    expect(r.rentBuyServices).toEqual(["Apple TV", "YouTube"]);
    expect(r.hasStreaming).toBe(true);
    expect(r.streamingOptions[0].type).toBe("subscription"); // sorted best-first
  });

  it("reports hasStreaming=false when only rent/buy exist", () => {
    const r = buildResult(1, "X", [
      { service: "Apple TV", serviceLogo: "", link: "", type: "buy", quality: "HD" },
    ], "tmdb");
    expect(r.hasStreaming).toBe(false);
    expect(r.availableServices).toEqual([]);
    expect(r.rentBuyServices).toEqual(["Apple TV"]);
  });
});

describe("fetchStreamingData — TMDB watch providers", () => {
  it("parses providers, dedupes plan variants, splits subscription vs rent/buy", async () => {
    mockFetch((url) =>
      url.includes("/movie/603")
        ? res(200, {
            title: "The Matrix",
            "watch/providers": {
              results: {
                PL: {
                  flatrate: [
                    { provider_name: "Netflix", logo_path: "/n.jpg" },
                    { provider_name: "Netflix Standard with Ads", logo_path: "/n2.jpg" },
                  ],
                  rent: [{ provider_name: "Apple TV", logo_path: "/a.jpg" }],
                  buy: [{ provider_name: "Apple TV", logo_path: "/a.jpg" }],
                },
              },
            },
          })
        : res(404, {})
    );

    const r = await fetchStreamingData(603, "PL", KEYS);
    expect(r.source).toBe("tmdb");
    expect(r.hasStreaming).toBe(true);
    expect(r.availableServices).toEqual(["Netflix"]); // plan variant collapsed
    expect(r.rentBuyServices).toEqual(["Apple TV"]); // rent+buy collapsed to one
    expect(r.streamingOptions.filter((o) => o.service === "Netflix")).toHaveLength(1);
    // Buttons must link directly to the service (not to themoviedb.org)
    const netflix = r.streamingOptions.find((o) => o.service === "Netflix");
    expect(netflix?.link).toContain("netflix.com");
    expect(netflix?.link).not.toContain("themoviedb.org");
  });

  it("returns a genuine empty (cacheable) when TMDB responds with no region providers", async () => {
    mockFetch((url) =>
      url.includes("/movie/603")
        ? res(200, { title: "X", "watch/providers": { results: { US: { flatrate: [] } } } })
        : res(404, {})
    );

    const r = await fetchStreamingData(603, "PL", KEYS);
    expect(r.source).toBe("none");
    expect(r.hasStreaming).toBe(false);
    expect(r.streamingOptions).toEqual([]);
  });

  it("THROWS (must not cache as empty) when TMDB is unreachable", async () => {
    mockFetch(() => {
      throw new Error("network down");
    });
    await expect(fetchStreamingData(603, "PL", KEYS)).rejects.toThrow();
  });

  it("THROWS on TMDB 5xx (transient), so it is retried rather than cached empty", async () => {
    mockFetch(() => res(503, {}));
    await expect(fetchStreamingData(603, "PL", KEYS)).rejects.toThrow();
  });

  it("queries only the TV endpoint when mediaType=tv", async () => {
    const seen: string[] = [];
    mockFetch((url) => {
      seen.push(url);
      return url.includes("/tv/1399")
        ? res(200, { name: "GoT", "watch/providers": { results: { PL: { flatrate: [{ provider_name: "HBO Max" }] } } } })
        : res(404, {});
    });

    const r = await fetchStreamingData(1399, "PL", KEYS, "tv");
    expect(r.hasStreaming).toBe(true);
    expect(r.availableServices).toEqual(["HBO Max"]);
    expect(seen.every((u) => u.includes("/tv/"))).toBe(true); // never hit /movie/
  });
});

describe("fetchStreamingData — RapidAPI fallback (MovieOfTheNight v4)", () => {
  it("uses /shows/tv/ (not /shows/series/) and parses streamingOptions for TV", async () => {
    const seen: string[] = [];
    mockFetch((url) => {
      seen.push(url);
      // TMDB (tv) responds but with no providers in PL -> genuine empty
      if (url.includes("api.themoviedb.org")) {
        return res(200, { name: "Show", "watch/providers": { results: { US: {} } } });
      }
      // RapidAPI v4 show endpoint
      if (url.includes("streaming-availability.p.rapidapi.com/shows/tv/1399")) {
        return res(200, {
          showType: "series",
          streamingOptions: {
            pl: [
              { service: { id: "netflix", name: "Netflix" }, type: "subscription", link: "https://www.netflix.com/title/1", quality: "hd" },
              { service: { id: "apple", name: "Apple TV" }, type: "rent", link: "https://tv.apple.com/x", price: { amount: "14.99", currency: "PLN", formatted: "14,99 zł" } },
            ],
          },
        });
      }
      return res(404, {});
    });

    const r = await fetchStreamingData(1399, "PL", { tmdbApiKey: "t", rapidApiKey: "r" }, "tv");

    expect(r.source).toBe("rapidapi");
    expect(r.hasStreaming).toBe(true);
    expect(r.availableServices).toEqual(["Netflix"]); // subscription only
    expect(r.rentBuyServices).toHaveLength(1); // the rent offer goes to rent/buy, not availableServices
    // The RapidAPI TV call must use /shows/tv/, never the wrong /shows/series/
    const rapidCalls = seen.filter((u) => u.includes("rapidapi.com"));
    expect(rapidCalls.some((u) => u.includes("/shows/tv/1399"))).toBe(true);
    expect(rapidCalls.some((u) => u.includes("/shows/series/"))).toBe(false);
  });
});

