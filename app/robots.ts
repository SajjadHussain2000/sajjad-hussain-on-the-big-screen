import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Bug #9: curious visitors who read this file find the hideout.
    rules: { userAgent: "*", allow: "/", disallow: "/bug-hideout" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
