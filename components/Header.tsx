"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { nav, site } from "@/lib/site";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          {site.name}
        </Link>

        <nav aria-label="Main" className={styles.nav} data-open={open}>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
