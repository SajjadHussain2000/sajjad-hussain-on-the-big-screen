import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Articles" };

export default function Articles() {
  return (
    <ComingSoon
      title="Articles"
      text="Articles on frontend engineering, performance and the occasional deep dive are in progress."
    />
  );
}
