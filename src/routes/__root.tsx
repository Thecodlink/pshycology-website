import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import SukoonGreetingLoader from "../components/Preloader/SukoonGreetingLoader";
import RouteTransition from "../components/RouteTransition/RouteTransition";
import ScrollTopButton from "../components/buttons/ScrollTopButton";
import { THEME_SCRIPT, INTRO_GUARD_SCRIPT } from "../lib/theme";
import {
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  organizationJsonLd,
} from "../lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md text-center">
        <img
          src="/images/brand/404-illustration.webp"
          alt=""
          width={768}
          height={768}
          className="mx-auto w-64 max-w-full sm:w-80"
        />
        <p className="mt-6 font-display text-5xl text-primary" aria-hidden="true">
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sukoon Nest | Psychology & Career Counselling" },
      {
        name: "description",
        content:
          "Compassionate psychology support and practical career guidance, available online and in person.",
      },
      { name: "author", content: SITE_NAME },
      { name: "theme-color", content: "#f7f3ea" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: "Sukoon Nest | Psychology & Career Counselling" },
      {
        property: "og:description",
        content: "A safe space for clarity, confidence and meaningful change.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sukoon Nest | Psychology & Career Counselling" },
      {
        name: "twitter:description",
        content: "A safe space for clarity, confidence and meaningful change.",
      },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Italiana&family=Shadows+Into+Light&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/favicon-16.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: THEME_SCRIPT / INTRO_GUARD_SCRIPT legitimately
    // mutate classList on <html> before hydration (theme + loader guards) —
    // React must not diff externally-managed attributes on this node.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Theme script runs before the stylesheet (HeadContent) so the correct
          light/dark class is applied before first paint — no color flash.
          React does not own this class; the script + ThemeToggle manage it.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} suppressHydrationWarning />
        {/* Pre-paint loader guards (.js / .no-intro classes) — see lib/theme. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_GUARD_SCRIPT }} suppressHydrationWarning />
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body>
        {/* Keyboard skip link: first tab stop on every page; targets the
            route-level <main> landmark (index + service routes). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Respects `prefers-reduced-motion`: Framer Motion otherwise defaults to
          `reducedMotion: "never"` and would animate even for users who disabled
          motion. This keeps SectionFade / Counter animation-free for them while
          content is always instantly visible. */}
      <MotionConfig reducedMotion="user">
        {/*
          One motion system, two roles:
          - SukoonGreetingLoader: first-entry multilingual welcome (SSR-safe
            overlay, auto-removed, never blocks interaction after exit).
          - RouteTransition: lightweight enter + cream wash for real route
            changes (pathname-keyed; same-page anchors never animate).
          Both are reduced-motion aware and share SUKOON_EASE timing.
        */}
        <SukoonGreetingLoader>
          <RouteTransition>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </RouteTransition>
          {/* Global return-to-top affordance (appears past a screen of scroll). */}
          <ScrollTopButton />
        </SukoonGreetingLoader>
      </MotionConfig>
    </QueryClientProvider>
  );
}
