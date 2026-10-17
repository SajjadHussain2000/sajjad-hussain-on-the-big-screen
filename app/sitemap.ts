import type { MetadataRoute } from "next";
import { nav, projects, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...nav.map((n) => ({ url: `${site.url}${n.href === "/" ? "" : n.href}` })),
    ...projects.map((p) => ({ url: `${site.url}/projects/${p.slug}` })),
  ];
}
