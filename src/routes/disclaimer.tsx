import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer – Sukoon Nest" },
      {
        name: "description",
        content:
          "Important information about how to use this website and the nature of the support described on it.",
      },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalPage eyebrow="Legal" title="Disclaimer">
      <p>
        <em>Last updated: September 2026.</em>
      </p>
      <h2 className="font-display text-xl text-foreground">Not emergency care</h2>
      <p>
        This website is informational. It is not a helpline and is not monitored in real time. If
        you are in immediate danger or experiencing a crisis, contact your local emergency services
        (112 in India) or go to the nearest hospital — do not wait on this site or on a message.
      </p>
      <h2 className="font-display text-xl text-foreground">
        Not a substitute for professional help
      </h2>
      <p>
        Nothing on this site — articles, service descriptions, FAQs or answers — is medical,
        psychological or legal advice, and reading it is not a substitute for speaking with a
        qualified professional about your own situation.
      </p>
      <h2 className="font-display text-xl text-foreground">Experience and outcomes</h2>
      <p>
        Testimonials and descriptions shared on this site reflect individual personal experiences.
        Support is a collaborative process, and outcomes differ from person to person; no result is
        guaranteed.
      </p>
      <h2 className="font-display text-xl text-foreground">External links</h2>
      <p>
        Links to WhatsApp, phone, email, Instagram, LinkedIn and Google Meet take you to services
        operated by third parties. We are not responsible for their content, policies or
        availability.
      </p>
      <h2 className="font-display text-xl text-foreground">Accuracy</h2>
      <p>
        We keep the site current and accurate to the best of our ability, and correct anything we
        are told is wrong. The site is provided on an as-is basis.
      </p>
      <h2 className="font-display text-xl text-foreground">Content ownership</h2>
      <p>
        The text, illustrations and design on this site belong to Sukoon Nest. Please ask before
        reusing them.
      </p>
    </LegalPage>
  );
}
