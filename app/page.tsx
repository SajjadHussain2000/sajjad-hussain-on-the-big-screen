import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import Bug from "@/components/hunt/Bug";
import { projects, site, skills } from "@/lib/site";
import styles from "./pages.module.css";

export default function Home() {
  const featured = projects.filter((p) => p.featured);
  const topSkills = skills.flatMap((s) => s.items).slice(0, 10);

  return (
    <>
      <section className={`container ${styles.hero} fade-up`} data-guide="This is the homepage. Scroll down for featured work.">
        <p className="eyebrow">Hi, I&apos;m</p>
        <h1>
          {site.name}
          <br />
          <span>{site.role}</span>
        </h1>
        <p className={styles.lead}>{site.shortBio}</p>
        <div className={styles.ctas}>
          <Link href="/projects" className="btn btn-primary">
            View projects
          </Link>
          {site.resume ? (
            <a href={site.resume} className="btn btn-ghost" download>
              Download résumé
            </a>
          ) : (
            <Link href="/about" className="btn btn-ghost">
              About me
            </Link>
          )}
        </div>
        <ul className={`tags ${styles.skillStrip}`} aria-label="Skills">
          {topSkills.map((s) => (
            <li key={s} className="tag">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="container section" data-guide="Selected projects. Each card opens a short case study.">
        <div className={styles.sectionHead}>
          <h2>Featured projects</h2>
          <Link href="/projects">All projects →</Link>
        </div>
        <div className={styles.grid}>
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <section className="container section" data-guide="Ten bugs are hidden on this site. You're welcome to hunt them down.">
        <div className={styles.band}>
          <p className="eyebrow">Bug Hunt</p>
          <h2>This site has bugs. On purpose.</h2>
          <p className="muted">
            Ten are hidden across these pages, some in plain sight and some in DevTools. Find them all
            and add your name to the Hall of Debuggers.
          </p>
          <Link href="/hall-of-debuggers" className="btn btn-ghost">
            View leaderboard
          </Link>
        </div>
      </section>

      <section className="container section" data-guide="If you'd like to get in touch, my email is one click away.">
        <div className={styles.band}>
          <Bug id={5} label="Bug: glowing in the dark" variant="glow">
            🪲
          </Bug>
          <h2>Let&apos;s work together</h2>
          <p className="muted">
            Have a project, a question or an interesting problem? I&apos;m always happy to talk.
          </p>
          <a href={`mailto:${site.email}`} className="btn btn-primary">
            Get in touch
          </a>
        </div>
      </section>
    </>
  );
}
