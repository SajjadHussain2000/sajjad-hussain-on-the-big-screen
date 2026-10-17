import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/site";
import styles from "../../pages.module.css";

// Every slug is prerendered via generateStaticParams, so blocking on params is fine here.
export const instant = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const prev = projects[index - 1];
  const next = projects[index + 1];

  return (
    <article className="container fade-up">
      <header className={styles.pageHead} data-guide="Each case study covers the problem, the approach and the outcome.">
        <p className="eyebrow">Case study</p>
        <h1>{project.title}</h1>
        <p className={styles.lead}>{project.summary}</p>
        <dl className={styles.meta}>
          {project.year && (
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
          )}
          {project.role && (
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.join(", ")}</dd>
          </div>
        </dl>
        {(project.liveUrl || project.repoUrl) && (
          <div className={styles.ctas}>
            {project.liveUrl && (
              <a href={project.liveUrl} className="btn btn-primary" target="_blank" rel="noopener">
                Visit live site ↗
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} className="btn btn-ghost" target="_blank" rel="noopener">
                View code ↗
              </a>
            )}
          </div>
        )}
      </header>

      {project.cover ? (
        <Image
          src={project.cover}
          alt={`Screenshot of ${project.title}`}
          width={1120}
          height={490}
          className={styles.caseCover}
          priority
        />
      ) : (
        <div className={styles.caseCover} aria-hidden="true" />
      )}

      <div className={styles.caseBody}>
        <section>
          <h2>Problem</h2>
          <p className="muted">{project.problem}</p>
        </section>
        <section>
          <h2>Approach</h2>
          <p className="muted">{project.approach}</p>
        </section>
        <section>
          <h2>Outcome</h2>
          <p className="muted">{project.result}</p>
        </section>
      </div>

      <nav className={styles.pager} aria-label="More projects">
        {prev ? <Link href={`/projects/${prev.slug}`}>← {prev.title}</Link> : <span />}
        {next ? <Link href={`/projects/${next.slug}`}>{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
