import type { Metadata } from "next";
import ProjectGrid from "@/components/ProjectGrid";
import { projects } from "@/lib/site";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    <div className="container fade-up">
      <header className={styles.pageHead} data-guide="Use the filters to narrow projects by technology.">
        <p className="eyebrow">Projects</p>
        <h1>Selected projects</h1>
        <p className={styles.lead}>Work and side projects, each with the problem, approach and outcome.</p>
      </header>
      <ProjectGrid projects={projects} />
    </div>
  );
}
