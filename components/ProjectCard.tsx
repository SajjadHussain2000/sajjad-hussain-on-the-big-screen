import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/site";
import Bug from "./hunt/Bug";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({ project, sticker }: { project: Project; sticker?: boolean }) {
  return (
    <article className={styles.card}>
      {sticker && (
        <Bug id={4} label="Bug: ladybug sticker" variant="sticker">
          🐞
        </Bug>
      )}
      {project.cover ? (
        <Image src={project.cover} alt="" width={640} height={360} className={styles.cover} />
      ) : (
        <div className={styles.cover} aria-hidden="true">
          {project.title.charAt(0)}
        </div>
      )}
      <div className={styles.body}>
        {project.year && <p className="eyebrow">{project.year}</p>}
        <h3 className={styles.title}>
          <Link href={`/projects/${project.slug}`} className={styles.link}>
            {project.title}
          </Link>
        </h3>
        <p className="muted">{project.summary}</p>
        <ul className="tags">
          {project.stack.map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
