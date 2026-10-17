"use client";

import { actions, useHunt } from "./store";
import styles from "./hunt.module.css";

type Props = {
  id: number;
  label: string;
  /** what the bug looks like while it's uncaught */
  children: React.ReactNode;
  /** what renders once caught or when bugs are hidden (e.g. the corrected word) */
  fixed?: React.ReactNode;
  variant?: "typo" | "peek" | "sticker" | "glow" | "sleepy";
  style?: React.CSSProperties;
};

export default function Bug({ id, label, children, fixed = null, variant, style }: Props) {
  const { hunt, hidden } = useHunt();
  if (hidden || hunt?.found.includes(id)) return <>{fixed}</>;

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    const from = e.currentTarget.getBoundingClientRect();
    if (await actions.catchBug(id)) flyToJar(from);
  }

  return (
    <button type="button" className={`${styles.bug} ${variant ? styles[variant] : ""}`}
      style={style} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

// Squash, then fly a little bug from where it was caught into the jar.
export function flyToJar(from: DOMRect, emoji = "🐞") {
  const jar = document.getElementById("bug-jar")?.getBoundingClientRect();
  if (!jar || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const el = document.createElement("div");
  el.textContent = emoji;
  el.className = styles.flying;
  el.style.left = `${from.left + from.width / 2}px`;
  el.style.top = `${from.top + from.height / 2}px`;
  document.body.append(el);

  const dx = jar.left + jar.width / 2 - (from.left + from.width / 2);
  const dy = jar.top + jar.height / 2 - (from.top + from.height / 2);
  el.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)" },
      { transform: "translate(-50%, -50%) scale(1.6, 0.5)", offset: 0.15 },
      { transform: "translate(-50%, -50%) scale(1)", offset: 0.3 },
      { transform: `translate(calc(${dx}px - 50%), calc(${dy}px - 50%)) scale(0.4)`, opacity: 0.6 },
    ],
    { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  ).onfinish = () => {
    el.remove();
    document.getElementById("bug-jar")?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.2) rotate(-8deg)" }, { transform: "scale(1)" }],
      { duration: 350, easing: "ease-out" },
    );
  };
}
