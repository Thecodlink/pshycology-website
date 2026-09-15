import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/layout/LegalPage";
import { EMAIL_HREF } from "@/lib/links";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy – Sukoon Nest" },
      {
        name: "description",
        content:
          "How Sukoon Nest's website handles information: no forms, no cookies, no trackers — and what does happen behind the scenes.",
      },
    ],
  }),
  component: PrivacyPage,
});

/* Written strictly to the site's actual behaviour (verified in code): the
   website sets no cookies, collects no visitor data, and uses no analytics
   or advertising scripts. */
function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy">
      <p>
        <em>Last updated: September 2026.</em>
      </p>
      <p>
        This website is designed to collect as little information about you as possible. It has no
        accounts, no contact or booking forms, no comments and no checkout — you can read the entire
        site without ever giving us anything.
      </p>
      <h2 className="font-display text-xl text-foreground">Cookies &amp; trackers</h2>
      <p>
        The site does not set its own cookies and does not include advertising, analytics or social
        tracker scripts. Nothing is stored in your browser by us.
      </p>
      <h2 className="font-display text-xl text-foreground">What does happen technically</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Web fonts are loaded from Google Fonts, which sees your IP address as part of serving that
          request (Google&apos;s policies apply to that request).
        </li>
        <li>
          Our hosting provider may process standard technical server logs (e.g. requests, status
          codes) needed to deliver and secure the site.
        </li>
      </ul>
      <h2 className="font-display text-xl text-foreground">When you contact us</h2>
      <p>
        The WhatsApp, phone and email links on this site open the respective services directly. Any
        message you choose to send is governed by that platform&apos;s privacy policy and our
        subsequent conversation; we use it only to respond to your enquiry.
      </p>
      <h2 className="font-display text-xl text-foreground">Counselling records</h2>
      <p>
        Clinical or session records, if you become a client, are handled by the practice itself
        under its own consent and confidentiality process — separately from this website, which
        stores none.
      </p>
      <h2 className="font-display text-xl text-foreground">Questions</h2>
      <p>
        Write to us at{" "}
        <a href={EMAIL_HREF} className="text-primary underline underline-offset-4">
          sukoonest2016@gmail.com
        </a>
        . If we ever change how this site works in a way that affects your information, this page
        will be updated here.
      </p>
    </LegalPage>
  );
}
