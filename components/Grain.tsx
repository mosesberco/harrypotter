/* Paper grain + foxing. One fixed SVG over the whole page. */
export default function Grain() {
  return (
    <svg className="grain" aria-hidden="true" width="100%" height="100%" preserveAspectRatio="none">
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  );
}
