"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/site";
import styles from "@/app/pages.module.css";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const tags = [...new Set(projects.flatMap((p) => p.stack))].sort();
  const shown = tag ? projects.filter((p) => p.stack.includes(tag)) : projects;

  return (
    <>
      <ul className={styles.filters} aria-label="Filter by technology">
        {[null, ...tags].map((t) => (
          <li key={t ?? "all"}>
            <button
              type="button"
              className={styles.filter}
              aria-pressed={tag === t}
              onClick={() => setTag(t)}
            >
              {t ?? "All"}
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.grid} aria-live="polite">
        {shown.map((p) => (
          <ProjectCard key={p.slug} project={p} sticker={p.slug === projects[1]?.slug} />
        ))}
      </div>
    </>
  );
}
