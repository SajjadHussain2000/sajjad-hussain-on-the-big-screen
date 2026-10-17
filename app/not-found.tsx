import Link from "next/link";
import styles from "./pages.module.css";

export default function NotFound() {
  return (
    <div className={`container ${styles.center}`} data-guide="That page doesn't exist. The menu above will get you back on track.">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="muted">This page doesn&apos;t exist. Unlike the other bugs on this site, that one wasn&apos;t intentional.</p>
      <Link href="/" className="btn btn-primary">
        Back home
      </Link>
    </div>
  );
}
