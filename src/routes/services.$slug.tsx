import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { ServiceDetail } from "@/components/ServiceDetail/ServiceDetail";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { SectionFade } from "@/components/SectionFade/SectionFade";
import { getServiceBySlug } from "@/lib/services";
import { OG_IMAGE, absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const service = getServiceBySlug(params.slug);
    const title = service ? service.title : "Service – Sukoon Nest";
    const description =
      service?.description ??
      "Explore Sukoon Nest's support areas — psychology counselling and career guidance.";
    const canonical = absoluteUrl(`/services/${params.slug}`);
    return {
      meta: [
        { title: `${title} – Sukoon Nest` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} – Sukoon Nest` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      links: canonical ? [{ rel: "canonical", href: canonical }] : [],
    };
  },
  component: ServiceDetailRoute,
});

function ServiceDetailRoute() {
  const { slug } = Route.useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <main id="main-content" className="botanical-bg min-h-screen">
        <SiteNav />
        <section className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center">
          <img
            src="/images/brand/404-illustration.webp"
            alt=""
            width={768}
            height={768}
            className="w-60 max-w-full sm:w-72"
          />
          <h1 className="mt-10 text-4xl font-display sm:text-5xl">Not sure where to begin?</h1>
          <p className="mt-4 max-w-md text-balance leading-relaxed text-muted-foreground">
            That service page doesn't exist yet. Take a look at the full list of support areas, or
            reach out for a conversation.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-input bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              ← Back to home
            </Link>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main id="main-content" className="botanical-bg min-h-screen">
      <SiteNav />
      <SectionFade>
        <ServiceDetail service={service} />
      </SectionFade>
      <SiteFooter />
    </main>
  );
}
