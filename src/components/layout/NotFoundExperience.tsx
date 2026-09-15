import { Link } from "@tanstack/react-router";

/*
 * The branded not-found experience. Two entry points, one component:
 *  - __root notFoundComponent: unknown paths inside the running app.
 *  - /404 route: prerendered by Start as the GitHub-Pages SPA shell
 *    (404.html) — real route, so the page is a 200 HTML document that the
 *    client then re-renders for any unmatched deep URL.
 */
export function NotFoundExperience() {
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
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
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
