import { createFileRoute } from "@tanstack/react-router";

import { NotFoundExperience } from "@/components/layout/NotFoundExperience";

// The GitHub Pages 404.html source. Real route (status 200) so Start can
// prerender it; the shell re-renders this view for any unmatched deep link.
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [{ title: "Page not found – Sukoon Nest" }, { name: "robots", content: "noindex" }],
  }),
  component: NotFoundExperience,
});
