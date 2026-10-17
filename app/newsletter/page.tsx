import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Newsletter" };

export default function Newsletter() {
  return (
    <ComingSoon
      title="Newsletter"
      text="A short email on one topic per issue. Subscriptions open soon."
    />
  );
}
