"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bugsFor, formatTime, MODES, type Mode } from "@/lib/hunt";
import { actions, isComplete, useHunt } from "./store";
import styles from "./hunt.module.css";

declare global {
  interface Window {
    catchBug?: () => Promise<string>;
  }
}

export default function BugJar() {
  const state = useHunt();
  const { hunt, open, toast } = state;
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);

  // Bug #7 lives in the console.
  useEffect(() => {
    console.log(
      "%c🐛 There's a bug in this console. Run catchBug() to catch it.",
      "font-size:14px;color:#4242fa;font-weight:bold",
    );
    window.catchBug = async () =>
      (await actions.catchBug(7)) ? "Caught. Check the jar." : "Not caught. See the message on the page.";
  }, []);

  const total = hunt ? bugsFor(hunt.mode).length : 0;
  const label = hunt
    ? `Bug Hunt: ${hunt.found.length} of ${total} bugs found`
    : "Open Bug Hunt";

  return (
    <>
      <button id="bug-jar" type="button" className={styles.jar} onClick={actions.open} aria-label={label}>
        <span aria-hidden="true">🫙</span>
        {hunt && !hunt.result && (
          <span className={styles.jarCount} aria-hidden="true">
            {hunt.found.length}/{total}
          </span>
        )}
      </button>

      <p className={styles.toast} role="status" data-show={!!toast}>
        {toast}
      </p>

      <dialog ref={dialog} className={styles.panel} onClose={actions.close} aria-labelledby="hunt-title">
        <div className={styles.panelHead}>
          <h2 id="hunt-title">Bug Hunt</h2>
          <button type="button" className={styles.close} onClick={actions.close} aria-label="Close">
            ×
          </button>
        </div>
        {!hunt ? <Intro /> : hunt.result ? <Result /> : isComplete(hunt) ? <Finish /> : <Hunting />}
        <label className={styles.hideToggle}>
          <input
            type="checkbox"
            checked={state.hidden}
            onChange={(e) => actions.setHidden(e.target.checked)}
          />
          Hide bugs while reading
        </label>
      </dialog>
    </>
  );
}

function Intro() {
  return (
    <>
      <p className="muted">
        Ten bugs are hidden across this site. Find them as quickly as you can, then sign the{" "}
        <Link href="/hall-of-debuggers" onClick={actions.close}>
          Hall of Debuggers
        </Link>
        .
      </p>
      <div className={styles.modes}>
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} type="button" className={styles.mode} onClick={() => actions.start(m)}>
            <strong>{MODES[m].label}</strong>
            <span>{MODES[m].blurb}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Elapsed({ from, penalty }: { from: number; penalty: number }) {
  const [now, setNow] = useState(from);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className={styles.timer}>{formatTime(Math.max(0, now - from) + penalty)}</span>;
}

function Hunting() {
  const { hunt } = useHunt();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  if (!hunt) return null;
  const bugs = bugsFor(hunt.mode);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = await actions.submitCode(code);
    setError(err);
    if (!err) setCode("");
  }

  return (
    <>
      <p className={styles.status}>
        <span>
          {MODES[hunt.mode].label} · {hunt.found.length}/{bugs.length} found
        </span>
        <Elapsed from={hunt.startedAt} penalty={hunt.penaltyMs} />
      </p>
      <ul className={styles.bugList}>
        {bugs.map((b) => {
          const found = hunt.found.includes(b.id);
          return (
            <li key={b.id} data-found={found}>
              <span>
                {found ? "✅" : b.technical ? "💻" : "🐛"} {found ? b.name : `Bug #${b.id}`}
              </span>
              {!found &&
                (hunt.hints[b.id] ? (
                  <em className="muted">{hunt.hints[b.id]}</em>
                ) : (
                  <button type="button" className={styles.hint} onClick={() => actions.hint(b.id)}>
                    Hint (+15s)
                  </button>
                ))}
            </li>
          );
        })}
      </ul>
      {hunt.mode === "full" && (
        <form onSubmit={submit} className={styles.codeForm}>
          <label htmlFor="bug-code">Found a code word?</label>
          <div>
            <input
              id="bug-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CODEWORD"
              autoComplete="off"
              maxLength={30}
            />
            <button type="submit" className="btn btn-primary">
              Catch
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      )}
      <button type="button" className={styles.giveUp} onClick={actions.reset}>
        Reset hunt
      </button>
    </>
  );
}

function Finish() {
  const { hunt } = useHunt();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(await actions.finish(String(form.get("name")), String(form.get("message"))));
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className={styles.finish}>
      <p className={styles.big}>All bugs found.</p>
      <p className="muted">Sign the Hall of Debuggers to see your rank.</p>
      {hunt && hunt.penaltyMs > 0 && (
        <p className="muted">Hint penalty: +{hunt.penaltyMs / 1000}s</p>
      )}
      <label>
        Name
        <input name="name" required maxLength={20} autoComplete="nickname" />
      </label>
      <label>
        <span>
          Message <span className="muted">(optional)</span>
        </span>
        <input name="message" maxLength={80} />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Signing…" : "Sign the wall"}
      </button>
    </form>
  );
}

function Result() {
  const { hunt } = useHunt();
  if (!hunt?.result) return null;
  return (
    <div className={styles.finish}>
      <p className={styles.big}>You placed #{hunt.result.rank}</p>
      <p className="muted">
        {MODES[hunt.mode].label} in {formatTime(hunt.result.timeMs)}
      </p>
      <Link href="/hall-of-debuggers" className="btn btn-primary" onClick={actions.close}>
        View the Hall of Debuggers
      </Link>
      <button type="button" className={styles.giveUp} onClick={actions.reset}>
        Play again
      </button>
    </div>
  );
}
