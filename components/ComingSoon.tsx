import Link from "next/link";
import styles from "@/app/pages.module.css";

export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className={`container ${styles.center} fade-up`} data-guide="This section is in progress. Check back soon.">
      <p className="eyebrow">Coming soon</p>
      <h1>{title}</h1>
      <p className="muted">{text}</p>
      <Link href="/" className="btn btn-ghost">
        ← Back to home
      </Link>
    </div>
  );
}
