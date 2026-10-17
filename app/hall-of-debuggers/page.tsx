import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatTime, MODES, type Mode } from "@/lib/hunt";
import { board, type Entry } from "@/lib/hunt-server";
import { StoreOffline } from "@/lib/store";
import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Hall of Debuggers",
  description: "Visitors who found every bug on this site.",
};

export default function HallOfDebuggers() {
  return (
    <div className="container fade-up">
      <header className={styles.pageHead} data-guide="Everyone here found all the bugs. You're welcome to join them.">
        <p className="eyebrow">Bug Hunt</p>
        <h1>Hall of Debuggers</h1>
        <p className={styles.lead}>
          Everyone who found every bug on this site. Open the jar in the bottom-right corner to start a hunt.
        </p>
      </header>
      <div className={styles.boards}>
        {(["quick", "full"] as Mode[]).map((mode) => (
          <section key={mode} className={styles.board}>
            <h2>{MODES[mode].label}</h2>
            <p className="muted">{MODES[mode].blurb}</p>
            <Suspense fallback={<p className="muted">Loading…</p>}>
              <Board mode={mode} />
            </Suspense>
          </section>
        ))}
      </div>
    </div>
  );
}

async function Board({ mode }: { mode: Mode }) {
  await connection(); // always read the live leaderboard
  let entries: Entry[];
  try {
    entries = await board(mode);
  } catch (e) {
    if (e instanceof StoreOffline) return <p className="muted">The leaderboard is temporarily offline.</p>;
    throw e;
  }
  if (!entries.length) return <p className="muted">No entries yet.</p>;

  return (
    <ol className={styles.ranking}>
      {entries.map((e, i) => (
        <li key={e.id}>
          <span className={styles.rank}>{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
          <span>
            <strong>{e.name}</strong>
            {e.message && <span className="muted"> — {e.message}</span>}
          </span>
          <code>{formatTime(e.timeMs)}</code>
        </li>
      ))}
    </ol>
  );
}
