import { ogCard, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.role}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard(site.name, site.role);
}
