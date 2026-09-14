/*
 * Data for the "How it works" five-step editorial journey on the home page.
 * Images live in `public/images/steps/` and are referenced by public URL.
 *
 * Note: only the first step is actionable (it opens the WhatsApp contact flow).
 * Steps 2–6 are informational and intentionally have no button — they describe
 * a real process without inventing links, phone numbers, meeting URLs or
 * prices.
 */

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  /** Action label shown on the inline CTA button (step 1 only). */
  cta?: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    title: "Book a free 10-minute call",
    description:
      "We start with a short 10-minute conversation to answer your questions, understand the process and see if this feels right.",
    image: "/images/steps/step-1.png",
    imageAlt: "Book a free 10-minute call — WhatsApp contact screen",
    cta: "Book a free 10 min call",
  },
  {
    number: "02",
    title: "Reach out on WhatsApp",
    description:
      "Message us with your questions, or let me know you'd like to book the free 10-minute call.",
    image: "/images/steps/step-2.webp",
    imageAlt: "Reach out on WhatsApp — conversation on the WhatsApp app",
  },
  {
    number: "03",
    title: "Have your free 10-minute call",
    description:
      "A short, no-pressure conversation where we answer your questions and you get a feel for how support would work for you.",
    image: "/images/steps/step-3.webp",
    imageAlt: "Have your free 10-minute call — a short introductory conversation",
  },
  {
    number: "04",
    title: "Decide what feels right",
    description:
      "Use the conversation to understand your options and ask what you need, then decide whether you'd like to continue.",
    image: "/images/steps/step-4.webp",
    imageAlt: "Decide what feels right — reflection and decision",
  },
  {
    number: "05",
    title: "Continue if you choose",
    description:
      "If you decide to move forward, you can choose the right session and complete booking and payment.",
    image: "/images/steps/step-5.png",
    imageAlt: "Continue if you choose — payment / session selection",
  },
  {
    number: "06",
    title: "Meet on Google Meet for your session",
    description:
      "Once booking and payment are complete, you'll receive your Google Meet link and join the full session online.",
    image: "/images/steps/step-6.webp",
    imageAlt: "Meet on Google Meet for your session — video call in a browser",
  },
];
