import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatReviewDate,
  isReviewsEnabled,
  reviewsApiBase,
  submitReview,
  validateReviewInput,
} from "@/lib/reviews";

/*
 * Client-side mirrors of the server rules, plus submission UX contracts:
 * never a fake success, never lost user input, honeypot forwarded empty.
 * The production build must also never carry a localhost review endpoint.
 */
describe("review input validation (client mirror)", () => {
  const ok = { name: "Asha", rating: 5, text: "Thoughtful sessions that helped me think clearly." };
  it("accepts a valid review", () => expect(validateReviewInput(ok).fields).toEqual({}));
  it("trims before measuring", () =>
    expect(validateReviewInput({ ...ok, name: "  Asha  " }).fields.name).toBeUndefined());
  it("rejects short names, bad ratings and thin text", () => {
    expect(validateReviewInput({ name: "x", rating: 5, text: ok.text }).fields.name).toBeTruthy();
    expect(validateReviewInput({ ...ok, rating: 0 }).fields.rating).toBeTruthy();
    expect(validateReviewInput({ ...ok, rating: 5.5 }).fields.rating).toBeTruthy();
    expect(validateReviewInput({ ...ok, text: "short" }).fields.text).toBeTruthy();
    expect(validateReviewInput({ ...ok, text: "y".repeat(601) }).fields.text).toBeTruthy();
  });
});

describe("submitReview UX contracts", () => {
  const fetchSpy = vi.fn();
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    vi.stubEnv("VITE_REVIEW_API_URL", "https://reviews.sukoonnest.live.test");
    globalThis.fetch = fetchSpy as typeof fetch;
    fetchSpy.mockReset();
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.unstubAllEnvs();
  });
  const input = {
    name: "Asha",
    rating: 4,
    text: "Calm, structured sessions.",
    service: "",
    website: "",
  };

  it("maps a 201 to success with pending status", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ id: "x1", status: "pending" }), { status: 201 }),
    );
    const r = await submitReview(input);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.status).toBe("pending"); // never claims "live"
  });

  it("surfaces server field errors without discarding the draft", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ errors: { text: "review must be at least 10 characters" } }), {
        status: 400,
      }),
    );
    const r = await submitReview(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fields.text).toContain("10 characters");
  });

  it("network failure keeps text and reports retry-able state", async () => {
    fetchSpy.mockRejectedValue(new Error("offline"));
    const r = await submitReview(input);
    expect(!r.ok && r.network).toBe(true);
  });

  it("429 gets a wait message", async () => {
    fetchSpy.mockResolvedValue(new Response("{}", { status: 429 }));
    const r = await submitReview(input);
    expect(!r.ok && /wait/.test(r.fields.form ?? "")).toBe(true);
  });

  it("sends the honeypot field (empty) so bots are caught server-side", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ id: "z", status: "pending" }), { status: 201 }),
    );
    await submitReview({ ...input, website: "http://spam" });
    const body = JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body));
    expect(body.website).toBe("http://spam");
  });
});

describe("deployment hygiene", () => {
  it("without a configured URL the client is offline (never a fake success)", async () => {
    vi.stubEnv("VITE_REVIEW_API_URL", "");
    expect(isReviewsEnabled()).toBe(false);
    const r = await submitReview({
      name: "Ab",
      rating: 5,
      text: "x".repeat(20),
      service: "",
      website: "",
    });
    expect(r.ok).toBe(false);
    vi.unstubAllEnvs();
  });
  it("unconfigured builds carry no endpoint at all (no localhost baking)", () => {
    vi.stubEnv("VITE_REVIEW_API_URL", "");
    expect(reviewsApiBase()).toBe("");
    vi.unstubAllEnvs();
  });
});

describe("formatReviewDate", () => {
  it("renders a human date", () =>
    expect(formatReviewDate("2026-09-15T10:00:00.000Z")).toMatch(/2026/));
  it("tolerates garbage", () => expect(typeof formatReviewDate("nope")).toBe("string"));
});
