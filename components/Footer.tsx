import Link from "next/link";
import { site } from "@/lib/site";
import Bug from "./hunt/Bug";
import styles from "./Footer.module.css";

export default async function Footer() {
  "use cache"; // year is fixed at build time; refreshes on every deploy
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className="muted">
          © {new Date().getFullYear()} {site.name}. Built with Next.js.
          <Bug id={6} label="Bug: sleeping in the footer" variant="sleepy">
            🐛
          </Bug>
        </p>
        <ul className={styles.links}>
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} rel="me noopener" target="_blank">
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${site.email}`}>Email</a>
          </li>
          <li>
            <Link href="/hall-of-debuggers">Hall of Debuggers</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
