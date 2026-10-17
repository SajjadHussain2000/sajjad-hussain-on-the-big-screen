import type { Metadata } from "next";
import Link from "next/link";
import { codeFor } from "@/lib/hunt-server";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Bug hideout", robots: { index: false } };

// Bug #9: linked only from robots.txt.
export default function BugHideout() {
  return (
    <div className={`container ${styles.center} fade-up`} data-guide="You found the hideout. Not many people do.">
      <p className="eyebrow">Disallowed in robots.txt</p>
      <h1>You found the hideout</h1>
      <p className="muted">Crawlers are asked to stay out. Curious developers are welcome. Your code word:</p>
      <p>
        <code style={{ fontSize: "var(--text-2xl)" }}>{codeFor(9)}</code>
      </p>
      <p className="muted">Enter it in the bug jar to catch this one.</p>
      <Link href="/" className="btn btn-ghost">
        ← Back home
      </Link>
    </div>
  );
}
