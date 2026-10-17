"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AvatarArt, { type Pose } from "./AvatarArt";
import { crawlerBus } from "./hunt/crawlerBus";
import { actions } from "./hunt/store";
import { site } from "@/lib/site";
import styles from "./Guide.module.css";

const FIRST_NAME = site.name.split(" ")[0];

// Clicking the avatar: friendly tour tips first, a few fun ones mixed in.
const CHATTER = [
  "Everything is in the menu at the top.",
  "Each project has a short case study behind it.",
  "My email is in the footer if you'd like to reach out.",
  "There's a dark mode toggle in the top-right corner.",
  "The jar in the corner starts a bug hunt. Entirely optional.",
];
const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

// When you reach the bottom of a page, suggest where to go next.
const NEXT: Record<string, { text: string; href: string; label: string }> = {
  "/": { text: "Next, you might like some background about me.", href: "/about", label: "About me" },
  "/about": { text: "Next, take a look at some of my work.", href: "/projects", label: "View projects" },
  "/projects": { text: "If you're up for a challenge, there's a bug hunt running on this site.", href: "/hall-of-debuggers", label: "View leaderboard" },
};
const nextFor = (path: string) =>
  NEXT[path] ??
  (path.startsWith("/projects/")
    ? { text: "There are more projects to see.", href: "/projects", label: "All projects" }
    : { text: "Thanks for visiting.", href: "/", label: "Back to home" });

// Where the guide stands on each page (vh above its resting spot). It walks there on navigation.
const SPOTS: Record<string, number> = { "/": 0, "/about": 2, "/projects": 18, "/hall-of-debuggers": 26 };
const spotFor = (path: string) => SPOTS[path] ?? (path.startsWith("/projects/") ? 24 : 10);

function greeting() {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  let returning = false;
  try {
    returning = localStorage.getItem("guide-visited") === "1";
    localStorage.setItem("guide-visited", "1");
  } catch {}
  return returning
    ? `${part}. Welcome back, good to see you again.`
    : `${part}, I'm ${FIRST_NAME}. Welcome. I'll point out the highlights as you scroll.`;
}

type Cta = { label: string; run: () => void };
type Bubble = { text: string; cta?: Cta };

// The avatar tour guide. Main job: welcome visitors and show them around.
// The crawling bug is a side gag: he swats it when it climbs on him and asks for help once.
export default function Guide() {
  const pathname = usePathname();
  const router = useRouter();
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [pose, setPose] = useState<Pose>("idle");
  const [hops, setHops] = useState(0);
  const busyUntil = useRef(0); // a tour line is on screen; side chatter must wait
  const lastLine = useRef("");
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const poseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /** Tour lines (default) always show. `side: true` lines only show when nothing else is being said. */
  const say = useCallback((text: string, opts: { cta?: Cta; side?: boolean } = {}) => {
    const ms = 2500 + text.length * 70 + (opts.cta ? 4000 : 0); // time to type out and read
    if (opts.side && Date.now() < busyUntil.current) return false;
    busyUntil.current = Date.now() + ms;
    setBubble({ text, cta: opts.cta });
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBubble(null), ms);
    return true;
  }, []);

  const gesture = useCallback((p: Pose) => {
    setPose(p);
    clearTimeout(poseTimer.current);
    poseTimer.current = setTimeout(() => setPose("idle"), p === "swat" ? 650 : 1300);
  }, []);

  // Welcome the visitor once, shortly after arriving.
  useEffect(() => {
    const t = setTimeout(() => {
      gesture("wave");
      say(greeting());
    }, 700);
    return () => clearTimeout(t);
  }, [say, gesture]);

  // Narrate sections as they reach the middle of the screen; suggest a next page at the bottom.
  useEffect(() => {
    const sections = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const line = (e.target as HTMLElement).dataset.guide;
          if (e.isIntersecting && line && line !== lastLine.current) {
            lastLine.current = line;
            say(line);
            gesture("wave");
          }
        }
      },
      { rootMargin: "-35% 0px -35% 0px" },
    );
    document.querySelectorAll("[data-guide]").forEach((el) => sections.observe(el));

    let suggested = false;
    const bottom = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || suggested) return;
        suggested = true;
        const next = nextFor(pathname);
        gesture("wave");
        say(next.text, { cta: { label: `${next.label} →`, run: () => router.push(next.href) } });
      },
      { threshold: 0.6 },
    );
    const footer = document.querySelector("footer");
    if (footer) bottom.observe(footer);

    return () => {
      sections.disconnect();
      bottom.disconnect();
    };
  }, [pathname, router, say, gesture]);

  // Coming back from another browser tab: hop and say hi.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      setHops((h) => h + 1);
      gesture("wave");
      say("Welcome back.");
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [say, gesture]);

  // Side gag: the bug occasionally climbs on him. Swat it, ask for help once, thank you when squashed.
  useEffect(() => {
    let lastSwat = 0;
    let lastShoo = 0;
    let asked = false;
    let thanked = crawlerBus.caughtAt;

    const t = setInterval(() => {
      const el = avatarRef.current;
      if (!el) return;
      const now = Date.now();

      if (crawlerBus.caughtAt > thanked) {
        thanked = crawlerBus.caughtAt;
        gesture("wave");
        say("Bug fixed. Nicely done.");
        return;
      }
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height * 0.25; // the head
      crawlerBus.homeX = cx;
      crawlerBus.homeY = cy;
      if (!crawlerBus.alive) return;

      const d = Math.hypot(crawlerBus.x - cx, crawlerBus.y - cy);
      if (d < 110 && now - lastSwat > 8000) {
        lastSwat = now;
        Object.assign(crawlerBus, { scaredAt: now, scareX: cx, scareY: cy });
        gesture("swat");
        if (!asked) {
          asked = say("A bug just climbed onto me. If you have a moment, feel free to squash it.", {
            side: true,
            cta: { label: "Start a bug hunt", run: actions.open },
          });
        } else if (now - lastShoo > 40_000 && say("Not now, bug.", { side: true })) {
          lastShoo = now;
        }
      }
    }, 150);
    return () => clearInterval(t);
  }, [say, gesture]);

  return (
    <div className={styles.guide} style={{ "--spot": `${spotFor(pathname)}vh` } as React.CSSProperties}>
      {bubble && (
        <div className={styles.bubble} role="dialog" aria-label={`${FIRST_NAME} says`} key={bubble.text}>
          <div className={styles.bubbleHead}>
            <span className={styles.name}>{FIRST_NAME}</span>
            <button type="button" className={styles.closeBubble} onClick={() => setBubble(null)} aria-label="Close">
              ×
            </button>
          </div>
          <Typed text={bubble.text} />
          {bubble.cta && (
            <button
              type="button"
              className={styles.askBtn}
              onClick={() => {
                setBubble(null);
                bubble.cta!.run();
              }}
            >
              {bubble.cta.label}
            </button>
          )}
        </div>
      )}
      <button
        ref={avatarRef}
        type="button"
        className={styles.avatar}
        aria-label={`${FIRST_NAME}'s avatar. Click to chat`}
        onClick={() => {
          gesture("wave");
          say(pick(CHATTER));
        }}
      >
        {/* remounting on page change / tab return replays the hop + walk */}
        <span key={`${pathname}-${hops}`} className={styles.hop}>
          <AvatarArt pose={pose} walk />
        </span>
      </button>
    </div>
  );
}

// Types the line out letter by letter; the full text is always available to screen readers.
function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((c) => (c >= text.length ? c : c + 1)), 28);
    return () => clearInterval(t);
  }, [text]);
  return (
    <p className={styles.text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      <span className={styles.caret} aria-hidden="true" data-done={n >= text.length} />
      <span className={styles.srOnly}>{text}</span>
    </p>
  );
}
