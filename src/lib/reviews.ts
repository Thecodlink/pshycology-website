/*
 * Public client for the Sukoon Nest review service.
 *
 * The base URL comes from VITE_REVIEW_API_URL (a PUBLIC build-time value — the
 * URL of your deployed review-server; it is not a secret and contains no
 * credentials). When it is unset the section renders in "offline" mode: real
 * empty/approve states, form disabled with a plain notice — never a fake
 * success. No localhost fallback is ever baked into a production build.
 */

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface PublicReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  service: string | null;
  created_at: string;
}

export interface SubmitReviewInput {
  name: string;
  rating: number;
  text: string;
  service: string;
  /** Honeypot: humans never fill it; bots do. Sent empty. */
  website: string;
}

export interface ReviewSubmissionResult {
  ok: true;
  id: string;
  status: ReviewStatus;
}
export interface ReviewFailure {
  ok: false;
  /** Field-level messages mirroring server validation keys. */
  fields: Partial<Record<"name" | "rating" | "text" | "service" | "form", string>>;
  /** True when the request never reached a healthy backend. */
  network: boolean;
}

/* Read lazily so builds/tests can vary the value without module-order traps. */
export function reviewsApiBase(): string {
  return (import.meta.env["VITE_REVIEW_API_URL"] ?? "").trim().replace(/\/+$/, "");
}
export function isReviewsEnabled(): boolean {
  return reviewsApiBase() !== "";
}

const REQUEST_TIMEOUT_MS = 8000;

export function validateReviewInput(input: { name: string; rating: number; text: string }): {
  fields: ReviewFailure["fields"];
} {
  const fields: ReviewFailure["fields"] = {};
  const name = input.name.trim();
  const text = input.text.trim();
  if (name.length < 2 || name.length > 40) fields.name = "Please use between 2 and 40 characters.";
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
    fields.rating = "Please choose a rating from 1 to 5 stars.";
  if (text.length < 10) fields.text = "A few more words please — at least 10 characters.";
  if (text.length > 600) fields.text = "Please keep your review under 600 characters.";
  return { fields };
}

export async function fetchApprovedReviews(limit = 12): Promise<PublicReview[]> {
  if (!isReviewsEnabled()) return [];
  const res = await fetch(`${reviewsApiBase()}/api/reviews?limit=${limit}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`reviews endpoint responded ${res.status}`);
  const data = (await res.json()) as { reviews: PublicReview[] };
  return Array.isArray(data.reviews) ? data.reviews : [];
}

export async function submitReview(
  input: SubmitReviewInput,
): Promise<ReviewSubmissionResult | ReviewFailure> {
  if (!isReviewsEnabled())
    return {
      ok: false,
      network: false,
      fields: { form: "The review inbox is temporarily closed." },
    };
  try {
    const res = await fetch(`${reviewsApiBase()}/api/reviews`, {
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: input.name.trim(),
        rating: input.rating,
        text: input.text.trim(),
        service: input.service.trim() || undefined,
        website: input.website,
      }),
    });
    if (res.status === 201) {
      const j = (await res.json()) as { id: string; status: ReviewStatus };
      return { ok: true, id: j.id, status: j.status };
    }
    const body = (await res.json().catch(() => null)) as {
      errors?: ReviewFailure["fields"];
    } | null;
    const fields = body?.errors ?? {};
    let message = "Something went wrong. Your words are still here — please try again.";
    if (res.status === 429) message = "That was quick — please wait a while before sharing again.";
    else if (res.status === 409) message = "You've already shared this review today.";
    else if (fields.form) message = fields.form;
    return { ok: false, network: false, fields: { ...fields, form: message } };
  } catch {
    return {
      ok: false,
      network: true,
      fields: { form: "We couldn't reach the review inbox. Your text is kept — try once more." },
    };
  }
}

export const formatReviewDate = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
};
