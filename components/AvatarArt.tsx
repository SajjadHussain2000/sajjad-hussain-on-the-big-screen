import styles from "./AvatarArt.module.css";

export type Pose = "idle" | "wave" | "swat";

type Props = {
  pose?: Pose;
  /** play a few walking steps on mount (remount with a new key to replay) */
  walk?: boolean;
  className?: string;
};

// Illustrated full-body stand-in for a photo: a friendly developer with glasses.
export default function AvatarArt({ pose = "idle", walk = false, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 140 240"
      className={`${styles.avatar} ${walk ? styles.walking : ""} ${className}`}
      data-pose={pose}
      role="img"
      aria-label="Illustrated avatar of Sajjad wearing glasses"
    >
      {/* shadow */}
      <ellipse className={styles.shadow} cx="70" cy="233" rx="38" ry="5" fill="rgb(0 0 0 / 0.18)" />

      {/* legs + shoes */}
      <g className={styles.legL}>
        <path d="M58 168 L55 220" stroke="#2f4470" strokeWidth="17" strokeLinecap="round" />
        <path d="M43 228 C43 220 52 218 60 220 C66 222 66 230 60 230 L46 230 C44 230 43 229 43 228 Z" fill="#1d1b26" />
        <path d="M44 229 H62" stroke="#f4f1ea" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className={styles.legR}>
        <path d="M82 168 L85 220" stroke="#2f4470" strokeWidth="17" strokeLinecap="round" />
        <path d="M97 228 C97 220 88 218 80 220 C74 222 74 230 80 230 L94 230 C96 230 97 229 97 228 Z" fill="#1d1b26" />
        <path d="M78 229 H96" stroke="#f4f1ea" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* back arm (static, viewer's left) */}
      <g className={styles.armL}>
        <path d="M42 112 C36 128 33 142 33 156" fill="none" stroke="var(--primary)" strokeWidth="13" strokeLinecap="round" />
        <circle cx="33" cy="161" r="7" fill="#c68a5f" />
      </g>

      {/* hoodie */}
      <path d="M36 176 C33 126 46 98 70 98 C94 98 107 126 104 176 C92 181 48 181 36 176 Z" fill="var(--primary)" />
      <path d="M52 100 L70 120 L88 100" fill="none" stroke="var(--on-primary)" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M65 120 v14 M75 120 v14" stroke="var(--on-primary)" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 150 Q70 158 90 150" fill="none" stroke="var(--on-primary)" strokeOpacity="0.25" strokeWidth="2" />
      {/* tiny "</>" on the hoodie */}
      <text x="70" y="146" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="700" fill="var(--on-primary)" fillOpacity="0.7">
        {"</>"}
      </text>

      {/* head (tilts gently) */}
      <g transform="translate(10 4)">
        <g className={styles.head}>
          <rect x="51" y="78" width="18" height="18" rx="6" fill="#b97a50" />
          <circle cx="33" cy="58" r="6" fill="#c68a5f" />
          <circle cx="87" cy="58" r="6" fill="#c68a5f" />
          <ellipse cx="60" cy="55" rx="27" ry="31" fill="#c68a5f" />
          <path d="M33 52 C29 26 44 16 61 16 C80 16 93 27 87 52 C85 41 77 33 62 33 C51 33 45 37 40 34 C38 41 35 45 33 52 Z" fill="#1f1a17" />
          {/* light, short beard and moustache */}
          <path d="M34 54 C34 74 42 90 60 92 C78 90 86 74 86 54 C84 64 81 70 77 72 C71 69 49 69 43 72 C39 70 36 64 34 54 Z" fill="#1f1a17" opacity="0.4" />
          <path d="M48 69.5 C53 66.5 67 66.5 72 69.5 C68 71 64 70.5 60 70 C56 70.5 52 71 48 69.5 Z" fill="#1f1a17" opacity="0.55" />
          <g className={styles.brows} stroke="#1f1a17" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M41 45 Q48 41 55 44" />
            <path d="M65 44 Q72 41 79 45" />
          </g>
          <g className={styles.eyes} fill="#1d1b26">
            <circle cx="48" cy="56" r="2.8" />
            <circle cx="72" cy="56" r="2.8" />
          </g>
          <g fill="rgb(255 255 255 / 0.18)" stroke="#1d1b26" strokeWidth="2.6">
            <rect x="37" y="47" width="22" height="18" rx="7" />
            <rect x="61" y="47" width="22" height="18" rx="7" />
          </g>
          <path d="M59 55 Q60 53 61 55 M37 54 L31 52 M83 54 L89 52" stroke="#1d1b26" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path className={styles.smile} d="M53 74 Q60 79 67 74" fill="none" stroke="#7a3a28" strokeWidth="2.6" strokeLinecap="round" />
          <ellipse className={styles.shout} cx="60" cy="75.5" rx="4" ry="4.5" fill="#5a2a1a" stroke="#e0a08a" strokeWidth="1.5" />
        </g>
      </g>

      {/* front arm: hangs by default, raised to wave and swat */}
      <g className={styles.armR}>
        <path d="M98 112 C104 128 107 142 107 156" fill="none" stroke="var(--primary)" strokeWidth="13" strokeLinecap="round" />
        <circle cx="107" cy="161" r="7.5" fill="#c68a5f" />
      </g>
    </svg>
  );
}
