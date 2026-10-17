// Small company marks shown next to employer names. Drawn with currentColor so they work in both themes.
// To use an official logo instead, replace the SVG below (or render an <img> from public/logos/).
export default function CompanyLogo({ name }: { name: "tivo" }) {
  if (name !== "tivo") return null;
  return (
    <svg width="26" height="24" viewBox="0 0 48 44" aria-hidden="true" style={{ flexShrink: 0 }}>
      {/* antennae */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="10" x2="13" y2="4" />
        <line x1="30" y1="10" x2="35" y2="4" />
      </g>
      <circle cx="12.5" cy="3.5" r="2.5" fill="currentColor" />
      <circle cx="35.5" cy="3.5" r="2.5" fill="currentColor" />
      {/* TV-shaped body */}
      <path d="M8 10 H40 Q44.5 10 43.5 14.5 L38.5 35.5 Q37.5 40 33 40 H15 Q10.5 40 9.5 35.5 L4.5 14.5 Q3.5 10 8 10 Z" fill="currentColor" />
      <text x="24" y="29.5" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="var(--font-heading)" fill="var(--bg)">
        TiVo
      </text>
    </svg>
  );
}
