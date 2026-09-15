import { useCallback, useEffect, useRef, useState, type FC } from "react";

import { StarRating } from "@/components/Reviews/StarRating";
import { services } from "@/lib/services";
import {
  fetchApprovedReviews,
  formatReviewDate,
  isReviewsEnabled,
  submitReview,
  validateReviewInput,
  type PublicReview,
  type ReviewFailure,
} from "@/lib/reviews";

/*
 * "Your experience matters" — the real review system.
 *
 * The list shows ONLY approved reviews fetched from the backend; submissions
 * land as pending and pass through moderation. Everything here is honest:
 * no fabricated names, ratings, or counts; empty and offline states are
 * first-class; text renders as plain text (React-escaped), never HTML.
 */

const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground/55 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60";

const Stars: FC<{ value: number }> = ({ value }) => (
  <>
    <span aria-hidden="true" className="flex gap-0.5 text-[#b07b55]">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="14"
          height="14"
          viewBox="0 0 15 15"
          fill={n <= value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M7.5 1.5l1.8 5.6h5.4l-4.4 3.4 1.7 5.5-4.4-3.1-4.4 3.1 1.7-5.5-4.4-3.4h5.4z" />
        </svg>
      ))}
    </span>
    <span className="sr-only">{`Rated ${value} out of 5 stars`}</span>
  </>
);

export const ReviewsSection: FC = () => {
  const [reviews, setReviews] = useState<PublicReview[] | null>(null);
  const [listError, setListError] = useState(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [service, setService] = useState("");
  const [website] = useState(""); // honeypot — humans never touch it
  const [fields, setFields] = useState<ReviewFailure["fields"]>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);

  const load = useCallback(() => {
    if (!isReviewsEnabled()) {
      setReviews([]);
      return;
    }
    setListError(false);
    fetchApprovedReviews()
      .then(setReviews)
      .catch(() => {
        setListError(true);
        setReviews([]);
      });
  }, []);
  useEffect(load, [load]);

  const onShareAnother = () => {
    setDone(false);
    setNotice(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const v = validateReviewInput({ name, rating, text });
    if (Object.keys(v.fields).length) {
      setFields(v.fields);
      setNotice(null);
      return;
    }
    setFields({});
    setBusy(true);
    const r = await submitReview({ name, rating, text, service, website });
    setBusy(false);
    if (r.ok) {
      // Draft is cleared only after confirmed persistence.
      setDone(true);
      setName("");
      setRating(0);
      setText("");
      setService("");
      requestAnimationFrame(() => thanksRef.current?.focus());
      return;
    }
    setFields(r.fields); // the draft stays intact for a retry
    setNotice(r.fields.form ?? "Something went wrong. Please try again.");
  };

  const shareFocus = () => nameRef.current?.focus();

  return (
    <section
      id="reviews"
      className="mx-auto max-w-7xl scroll-mt-16 px-5 py-16 lg:px-8 lg:py-24"
      aria-labelledby="reviews-heading"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">Reviews</p>
      <h2 id="reviews-heading" className="text-4xl sm:text-5xl">
        Your experience matters
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        If you&apos;ve spent time with Sukoon Nest, we&apos;d be grateful if you shared a few words
        about your experience. Reviews appear here only after they&apos;ve been read by the practice
        — nothing is written on your behalf.
      </p>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* ---------- approved reviews ---------- */}
        <div aria-label="Published reviews" role="region">
          {reviews === null && !listError && (
            <div className="flex flex-col gap-5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[132px] rounded-[1.25rem] bg-secondary/70 motion-safe:animate-pulse"
                />
              ))}
            </div>
          )}
          {listError && (
            <div className="rounded-[1.25rem] border border-border bg-secondary/60 px-5 py-6 text-sm text-muted-foreground">
              Reviews couldn&apos;t load right now.{" "}
              <button
                type="button"
                onClick={load}
                className="font-medium text-primary underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}
          {reviews !== null && reviews.length === 0 && !listError && (
            <div className="rounded-[1.25rem] border border-border bg-card px-6 py-10 text-center soft-shadow">
              <p className="font-display text-2xl text-foreground">The first words are yours.</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                No reviews have been published yet. If you&apos;d like to be the first, share a few
                honest words below — they&apos;ll appear once they&apos;ve been read.
              </p>
              <button
                type="button"
                onClick={shareFocus}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Share your experience
              </button>
            </div>
          )}
          {reviews !== null && reviews.length > 0 && (
            <ul className="flex flex-col gap-5">
              {reviews.map((rv, i) => (
                <li
                  key={rv.id}
                  className="reveal-up rounded-[1.25rem] border border-border bg-card p-5 soft-shadow sm:p-6"
                  style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Stars value={rv.rating} />
                    <time dateTime={rv.created_at} className="text-[11px] text-muted-foreground/80">
                      {formatReviewDate(rv.created_at)}
                    </time>
                  </div>
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-ink-soft">
                    {rv.text}
                  </p>
                  <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <b className="font-display text-lg font-normal text-foreground">{rv.name}</b>
                    {rv.service && (
                      <span className="rounded-full bg-sage-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                        {rv.service}
                      </span>
                    )}
                  </footer>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- submission form ---------- */}
        <div className="rounded-[1.5rem] border border-border bg-secondary/70 p-6 soft-shadow sm:p-8">
          {done ? (
            <div>
              <h3
                ref={thanksRef}
                tabIndex={-1}
                className="font-display text-2xl text-foreground focus-visible:outline-none"
              >
                Thank you for sharing your experience.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your review has been received and will be read before it appears on the website.
              </p>
              <button
                type="button"
                onClick={onShareAnother}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-input bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Share another
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-describedby="review-privacy">
              <p
                id="review-privacy"
                className="mb-5 rounded-xl bg-card/80 px-3.5 py-2.5 text-[12px] leading-relaxed text-muted-foreground"
              >
                Please don&apos;t include sensitive personal, medical, or confidential information
                in your review.
              </p>

              <div className="grid gap-5">
                <div>
                  <label
                    htmlFor="rv-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Name{" "}
                    <span className="font-normal normal-case tracking-normal">
                      (shown with your review)
                    </span>
                  </label>
                  <input
                    id="rv-name"
                    ref={nameRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    autoComplete="name"
                    disabled={!isReviewsEnabled() || busy}
                    aria-invalid={fields.name ? true : undefined}
                    aria-describedby={fields.name ? "rv-name-err" : undefined}
                    className={inputCls}
                    placeholder="How you'd like to appear"
                  />
                  {fields.name && (
                    <p id="rv-name-err" className="mt-1.5 text-[13px] text-destructive">
                      {fields.name}
                    </p>
                  )}
                </div>

                <StarRating
                  name="rv-rating"
                  value={rating}
                  onChange={setRating}
                  disabled={!isReviewsEnabled() || busy}
                />
                {fields.rating && (
                  <p role="alert" className="-mt-2 text-[13px] text-destructive">
                    {fields.rating}
                  </p>
                )}

                <div>
                  <label
                    htmlFor="rv-text"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Your experience
                  </label>
                  <textarea
                    id="rv-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    maxLength={600}
                    disabled={!isReviewsEnabled() || busy}
                    aria-invalid={fields.text ? true : undefined}
                    aria-describedby={fields.text ? "rv-text-err" : "rv-count"}
                    className={inputCls + " resize-y"}
                    placeholder="A few words about what the sessions were like for you."
                  />
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    {fields.text ? (
                      <p id="rv-text-err" className="text-[13px] text-destructive">
                        {fields.text}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span
                      id="rv-count"
                      className="text-[11px] tabular-nums text-muted-foreground/70"
                    >
                      {text.trim().length}/600
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rv-service"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Which support?{" "}
                    <span className="font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <select
                    id="rv-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    disabled={!isReviewsEnabled() || busy}
                    className={inputCls}
                  >
                    <option value="">Prefer not to say</option>
                    {services.map((sv) => (
                      <option key={sv.id} value={sv.title}>
                        {sv.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Honeypot — off-screen, unfocusable, meaningful only to bots. */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-px w-px overflow-hidden"
                >
                  <label htmlFor="rv-website">Leave this field empty</label>
                  <input
                    id="rv-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    readOnly
                  />
                </div>

                {notice && (
                  <p
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive"
                  >
                    {notice}
                  </p>
                )}

                {!isReviewsEnabled() && (
                  <p className="text-[13px] text-muted-foreground">
                    The review inbox is being connected and isn't accepting submissions yet.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isReviewsEnabled() || busy || rating === 0}
                  aria-busy={busy || undefined}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {busy ? "Sending…" : "Share your experience"}
                </button>
                {rating === 0 && !busy && isReviewsEnabled() && (
                  <p className="-mt-3 text-[12px] text-muted-foreground/80">
                    Choose a rating to enable sharing.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
