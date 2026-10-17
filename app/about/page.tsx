import type { Metadata } from "next";
import Image from "next/image";
import { education, experience, site, skills } from "@/lib/site";
import AvatarArt from "@/components/AvatarArt";
import CompanyLogo from "@/components/CompanyLogo";
import Bug from "@/components/hunt/Bug";
import hunt from "@/components/hunt/hunt.module.css";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <div className="container fade-up">
      <header className={styles.pageHead} data-guide="Here's my background in brief.">
        <p className="eyebrow">About</p>
        <h1>About me</h1>
        <p className={styles.lead}>
          <Bug id={2} label="Bug: typo in Sofware" variant="typo" fixed="Software">
            Sofware
          </Bug>{" "}
          engineer focused on fast, reliable interfaces and the systems behind them.
        </p>
      </header>

      <div className={styles.aboutGrid}>
        <div className={styles.prose}>
          {site.longBio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className={styles.currently}>
            {site.currently.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className={styles.ctas}>
            {site.resume && (
              <a href={site.resume} className="btn btn-primary" download>
                Download résumé
              </a>
            )}
            <a href={`mailto:${site.email}`} className="btn btn-ghost">
              Email me
            </a>
          </div>
        </div>
        <div className={hunt.peekWrap}>
          <Bug id={3} label="Bug: peeking from behind the photo" variant="peek">
            🐛
          </Bug>
          {site.photo ? (
            <Image
              src={site.photo}
              alt={`Photo of ${site.name}`}
              width={560}
              height={560}
              className={styles.photo}
              priority
            />
          ) : (
            <div className={styles.photo}>
              <AvatarArt className={styles.photoArt} />
            </div>
          )}
        </div>
      </div>

      <section className="section" data-guide="My professional experience, most recent first.">
        <h2 className={styles.sectionHead}>Experience</h2>
        <ol className={styles.timeline}>
          {experience.map((role) => (
            <li key={role.company + role.period}>
              <p className="eyebrow">
                {role.period}
                {role.location && ` · ${role.location}`}
              </p>
              <h3>{role.title}</h3>
              <p className={styles.company}>
                {role.logo && <CompanyLogo name={role.logo} />}
                {role.company}
              </p>
              <ul>
                {role.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" data-guide="The languages and tools I use most.">
        <h2 className={styles.sectionHead}>Skills</h2>
        <div className={styles.skillGrid}>
          {skills.map((s) => (
            <div key={s.group} className={styles.skillGroup}>
              <h3>{s.group}</h3>
              <ul className="tags">
                {s.items.map((i) => (
                  <li key={i} className="tag">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {education.length > 0 && (
        <section className="section" data-guide="And where I studied.">
          <h2 className={styles.sectionHead}>Education</h2>
          <ul className={styles.timeline}>
            {education.map((e) => (
              <li key={e.title}>
                <p className="eyebrow">{e.period}</p>
                <h3>{e.title}</h3>
                <p className="muted">{e.place}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
