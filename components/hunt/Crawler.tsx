"use client";

import { useEffect, useRef } from "react";
import { flyToJar } from "./Bug";
import { crawlerBus } from "./crawlerBus";
import { actions, useHunt } from "./store";
import styles from "./hunt.module.css";

const NEAR_PX = 150; // pointer this close → the bug freezes up and barely moves
const CATCH_PX = 50; // a click this close to the bug squashes it

// Bug #1: a pixel-art software bug that creeps along the screen edges and sometimes climbs onto the guide.
export default function Crawler() {
  const { hunt, hidden } = useHunt();
  const active = !hidden && !hunt?.found.includes(1);
  const pathRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const body = bodyRef.current;
    if (!active || !path || !body) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = matchMedia("(hover: none)").matches;

    // stays around the guide (falls back to the guide's usual spot)
    const home = () =>
      crawlerBus.homeX > 0
        ? { x: crawlerBus.homeX, y: crawlerBus.homeY }
        : { x: innerWidth - 110, y: innerHeight - 260 };
    const clampX = (v: number) => Math.max(30, Math.min(innerWidth - 30, v));
    const clampY = (v: number) => Math.max(80, Math.min(innerHeight - 30, v));

    let x = clampX(60);
    let y = clampY(innerHeight - 60);
    let heading = -Math.PI / 2;
    let speed = 0;
    let tx = x;
    let ty = y;
    let pause = 0; // seconds left standing still
    let scurry = 0; // seconds left of a fast run
    let px = -999;
    let py = -999;
    let catching = false;
    let seenScare = crawlerBus.scaredAt;
    let last = performance.now();
    let raf = 0;

    let lastVisit = performance.now(); // don't bother the guide right away

    // Mostly creeps along the screen edges like a real bug; only now and then visits the guide.
    const pick = () => {
      const now = performance.now();
      if (now - lastVisit > 25_000 && Math.random() < 0.15) {
        lastVisit = now;
        const h = home();
        tx = clampX(h.x + (Math.random() - 0.5) * 40); // onto his hoodie
        ty = clampY(h.y + 50 + Math.random() * 40);
        return;
      }
      const along = Math.random();
      if (Math.random() < 0.7) {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) [tx, ty] = [along * innerWidth, 90]; // just under the header
        else if (edge === 1) [tx, ty] = [innerWidth - 40, along * innerHeight];
        else if (edge === 2) [tx, ty] = [along * innerWidth, innerHeight - 40];
        else [tx, ty] = [40, along * innerHeight];
      } else {
        [tx, ty] = [along * innerWidth, Math.random() * innerHeight];
      }
      tx = clampX(tx);
      ty = clampY(ty);
    };

    const render = () => {
      // pixel art looks best in 8 directions, like an old-school game sprite
      const facing = Math.round(heading / (Math.PI / 4)) * (Math.PI / 4);
      path.style.transform = `translate(${x}px, ${y}px)`;
      body.style.transform = `translate(-50%, -50%) rotate(${facing + Math.PI / 2}rad)`;
      path.dataset.moving = String(pause <= 0 && speed > 8);
    };

    async function tryCatch() {
      if (catching) return;
      catching = true;
      const rect = body!.getBoundingClientRect();
      if (await actions.catchBug(1)) {
        crawlerBus.caughtAt = Date.now();
        showFixed(rect);
        flyToJar(rect, "🐛");
      } else catching = false;
    }

    function onMove(e: PointerEvent) {
      px = e.clientX;
      py = e.clientY;
    }

    function onDown(e: PointerEvent) {
      if (Math.hypot(e.clientX - x, e.clientY - y) < CATCH_PX) {
        e.preventDefault();
        tryCatch();
      }
    }

    function tick(t: number) {
      const dt = Math.min(50, t - last) / 1000;
      last = t;
      const near = !touch && Math.hypot(px - x, py - y) < NEAR_PX;

      // the guide swatted at us: scurry away from him
      if (crawlerBus.scaredAt !== seenScare) {
        seenScare = crawlerBus.scaredAt;
        const away = Math.atan2(y - crawlerBus.scareY, x - crawlerBus.scareX);
        tx = clampX(crawlerBus.scareX + Math.cos(away) * 200);
        ty = clampY(crawlerBus.scareY + Math.sin(away) * 200);
        pause = 0;
        scurry = 0.8;
      }

      if (pause > 0) {
        pause -= dt;
        speed = 0;
        if (pause <= 0) pick();
      } else {
        if (Math.random() < 0.2 * dt) {
          pick();
          scurry = 0.5;
        }
        scurry = Math.max(0, scurry - dt);

        const dx = tx - x;
        const dy = ty - y;
        if (Math.hypot(dx, dy) < 10) {
          if (Math.random() < 0.7) pause = 1 + Math.random() * 3; // bugs sit still a lot
          else pick();
        }

        let turn = Math.atan2(dy, dx) - heading;
        turn = Math.atan2(Math.sin(turn), Math.cos(turn));
        const maxTurn = (scurry ? 8 : 4) * dt;
        heading += Math.max(-maxTurn, Math.min(maxTurn, turn));

        const cruise = near ? 12 : scurry ? 230 : touch ? 45 : 60;
        speed += (cruise - speed) * Math.min(1, dt * (near ? 12 : 5));
        x = Math.max(20, Math.min(innerWidth - 20, x + Math.cos(heading) * speed * dt));
        y = Math.max(20, Math.min(innerHeight - 20, y + Math.sin(heading) * speed * dt));
      }
      render();
      crawlerBus.x = x;
      crawlerBus.y = y;
      raf = requestAnimationFrame(tick);
    }

    pick();
    render();
    Object.assign(crawlerBus, { alive: true, x, y });
    if (!reduce) raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      crawlerBus.alive = false;
    };
  }, [active]);

  if (!active) return null;
  return (
    <div ref={pathRef} className={styles.crawlerPath} data-moving="false">
      <button
        ref={bodyRef}
        type="button"
        className={styles.crawler}
        aria-label="Bug: a software bug crawling around the avatar"
        onClick={async (e) => {
          if (e.detail !== 0) return; // keyboard only; pointer catches happen on pointerdown
          const rect = e.currentTarget.getBoundingClientRect();
          if (await actions.catchBug(1)) {
            crawlerBus.caughtAt = Date.now();
            showFixed(rect);
          }
        }}
      >
        <BugSprite />
      </button>
    </div>
  );
}

// Squashed! A "✓ fixed" badge pops up where the bug was.
function showFixed(rect: DOMRect) {
  const el = document.createElement("div");
  el.className = styles.fixedBadge;
  el.textContent = "✓ fixed";
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 2}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1400);
}

// 13×13 pixel sprite facing up. Two leg frames alternate while walking.
const P = (x: number, y: number, fill: string, key?: string) => (
  <rect key={key ?? `${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />
);
const SHELL = "#00cc88";
const SHINE = "#5dffc4";
const DARK = "#0a5c40";
const INK = "var(--text)"; // dark outline in light mode, light outline in dark mode
const EYE = "var(--bg)";

function BugSprite() {
  const body: React.ReactNode[] = [];
  // shell rows: [y, fromX, toX]
  const rows: [number, number, number][] = [
    [4, 4, 8],
    [5, 3, 9],
    [6, 3, 9],
    [7, 3, 9],
    [8, 3, 9],
    [9, 3, 9],
    [10, 4, 8],
    [11, 5, 7],
  ];
  for (const [y, a, b] of rows) for (let x = a; x <= b; x++) body.push(P(x, y, x === 6 ? DARK : SHELL));
  return (
    <svg width="45" height="45" viewBox="0 0 13 13" shapeRendering="crispEdges" aria-hidden="true">
      {/* antennae */}
      <g className={styles.antennae}>
        {P(3, 0, INK)}
        {P(4, 1, INK)}
        {P(9, 0, INK)}
        {P(8, 1, INK)}
      </g>
      {/* legs: two frames */}
      <g className={styles.legsA}>
        {[P(2, 5, INK), P(1, 4, INK), P(2, 7, INK), P(1, 7, INK), P(2, 9, INK), P(1, 10, INK)]}
        {[P(10, 5, INK), P(11, 4, INK), P(10, 7, INK), P(11, 7, INK), P(10, 9, INK), P(11, 10, INK)]}
      </g>
      <g className={styles.legsB}>
        {[P(2, 5, INK), P(1, 6, INK), P(2, 7, INK), P(1, 8, INK), P(2, 9, INK), P(1, 9, INK)]}
        {[P(10, 5, INK), P(11, 6, INK), P(10, 7, INK), P(11, 8, INK), P(10, 9, INK), P(11, 9, INK)]}
      </g>
      {/* head with eyes */}
      {[4, 5, 6, 7, 8].map((x) => P(x, 2, INK, `h2-${x}`))}
      {[4, 5, 6, 7, 8].map((x) => P(x, 3, x === 5 || x === 7 ? EYE : INK, `h3-${x}`))}
      {/* shell, spots and shine */}
      {body}
      {P(4, 6, DARK, "s1")}
      {P(8, 7, DARK, "s2")}
      {P(5, 9, DARK, "s3")}
      {P(4, 5, SHINE, "sh1")}
      {P(8, 5, SHINE, "sh2")}
    </svg>
  );
}
