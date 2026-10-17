import styles from "./AvatarArt.module.css";

export type Pose = "idle" | "wave" | "swat";

type Props = {
  pose?: Pose;
  /** play a few walking steps on mount (remount with a new key to replay) */
  walk?: boolean;
  className?: string;
};

// 24×36 pixel-art sprite of a developer with glasses, a light beard and a hoodie.
// Layers (arms, legs, eyes, mouth) are toggled by CSS to animate poses frame by frame.

type Rect = [x: number, y: number, w: number, h: number, color: string];

const C: Record<string, string> = {
  H: "#1f1a17", // hair
  S: "#c68a5f", // skin
  s: "#a96f48", // skin shadow
  G: "#1d1b26", // glasses frame
  g: "#dfe7f5", // lens
  E: "#1d1b26", // eye
  M: "#7a3a28", // mouth
  P: "var(--primary)", // hoodie
  W: "#f4f1ea", // hoodie strings, soles
  J: "#2f4470", // jeans
  K: "#1d1b26", // shoes
  x: "rgb(0 0 0 / 0.18)", // ground shadow
};
// Shaded pixels: a base colour with a translucent overlay.
const OVERLAY: Record<string, [string, string]> = {
  p: ["var(--primary)", "rgb(0 0 0 / 0.2)"], // hoodie shade
  B: ["#c68a5f", "rgb(31 26 23 / 0.4)"], // light beard over skin
};

const BASE = [
  "........HHHHHHHH........",
  "......HHHHHHHHHHHH......",
  ".....HHHHHHHHHHHHHH.....",
  ".....HHHHHHHHHHHHHH.....",
  ".....HHSSSSSSSSSSHH.....",
  ".....HSSSSSSSSSSSSH.....",
  "....sSGGGGGSSGGGGGSs....",
  "....sSGgggGGGGgggGSs....",
  "....sSGGGGGSSGGGGGSs....",
  ".....SSSSSSssSSSSSS.....",
  ".....BSSSSSSSSSSSSB.....",
  ".....BBSSBBBBBBSSBB.....",
  ".....BBSSSSSSSSSSBB.....",
  "......BBBSSSSSSBBB......",
  ".......BBBBBBBBBB.......",
  ".........SSSSSS.........",
  "....PPPPPPpSSpPPPPPP....",
  "...PPPPPPPPppPPPPPPPP...",
  "...PPPPPPWPPPPWPPPPPP...",
  "...PPPPPPWPPPPWPPPPPP...",
  "...PPPPPPPPPPPPPPPPPP...",
  "...PPPPPPPPPPPPPPPPPP...",
  "...PPPPPpPPPPPPpPPPPP...",
  "...PPPPPppppppppPPPPP...",
  "...PPPPPPPPPPPPPPPPPP...",
  "...pppppppppppppppppp...",
];

/** Turns a pixel map into rects, merging horizontal runs of the same colour. */
function fromMap(rows: string[]): Rect[] {
  const out: Rect[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let w = 1;
      while (row[x + w] === ch) w++;
      if (ch !== ".") {
        if (OVERLAY[ch]) out.push([x, y, w, 1, OVERLAY[ch][0]], [x, y, w, 1, OVERLAY[ch][1]]);
        else out.push([x, y, w, 1, C[ch]]);
      }
      x += w;
    }
  });
  return out;
}

const body = fromMap(BASE);
const leg = (x: number, lift: number): Rect[] => [
  [x, 26, 4, 7 - lift, C.J],
  [x - (x < 12 ? 1 : 0), 33 - lift, 5, 1, C.K],
  [x - (x < 12 ? 1 : 0), 34 - lift, 5, 1, C.W],
];
const LAYERS = {
  shadow: [[5, 35, 14, 1, C.x]] as Rect[],
  armL: [[1, 17, 2, 8, C.P], [1, 25, 2, 2, C.S]] as Rect[],
  armDown: [[21, 17, 2, 8, C.P], [21, 25, 2, 2, C.S]] as Rect[],
  waveA: [[21, 9, 2, 8, C.P], [21, 7, 2, 2, C.S]] as Rect[],
  waveB: [[21, 14, 2, 3, C.P], [22, 11, 2, 3, C.P], [23, 9, 2, 2, C.P], [23, 7, 2, 2, C.S]] as Rect[],
  swatArm: [[21, 16, 3, 2, C.P], [24, 15, 2, 2, C.P], [26, 14, 2, 2, C.S]] as Rect[],
  legsIdle: [...leg(7, 0), ...leg(13, 0)],
  legsA: [...leg(7, 1), ...leg(13, 0)],
  legsB: [...leg(7, 0), ...leg(13, 1)],
  eyes: [[8, 7, 1, 1, C.E], [15, 7, 1, 1, C.E]] as Rect[],
  smile: [[10, 12, 4, 1, C.M], [9, 11, 1, 1, C.M], [14, 11, 1, 1, C.M]] as Rect[],
  shout: [[11, 12, 2, 2, C.M]] as Rect[],
};

const draw = (rects: Rect[]) =>
  rects.map(([x, y, w, h, fill], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />);

export default function AvatarArt({ pose = "idle", walk = false, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 24 36"
      shapeRendering="crispEdges"
      className={`${styles.avatar} ${walk ? styles.walking : ""} ${className}`}
      data-pose={pose}
      role="img"
      aria-label="Pixel-art avatar of Sajjad wearing glasses"
    >
      <g>{draw(LAYERS.shadow)}</g>
      <g className={styles.legsIdle}>{draw(LAYERS.legsIdle)}</g>
      <g className={styles.legsA}>{draw(LAYERS.legsA)}</g>
      <g className={styles.legsB}>{draw(LAYERS.legsB)}</g>
      <g>{draw(LAYERS.armL)}</g>
      <g>{draw(body)}</g>
      <g className={styles.eyes}>{draw(LAYERS.eyes)}</g>
      <g className={styles.smile}>{draw(LAYERS.smile)}</g>
      <g className={styles.shout}>{draw(LAYERS.shout)}</g>
      <g className={styles.armDown}>{draw(LAYERS.armDown)}</g>
      <g className={styles.waveA}>{draw(LAYERS.waveA)}</g>
      <g className={styles.waveB}>{draw(LAYERS.waveB)}</g>
      <g className={styles.swatArm}>{draw(LAYERS.swatArm)}</g>
    </svg>
  );
}
