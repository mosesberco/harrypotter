/* Original engraved line-art. Stroke-based, currentColor, no raster assets,
   no licensed imagery — the whole visual language of the site comes from here. */

type P = { className?: string; size?: number };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

/* printer's ornament between rules */
export function Fleuron({ className }: P) {
  return (
    <svg viewBox="0 0 64 16" width="64" height="16" className={className} aria-hidden="true">
      <g {...base}>
        <path d="M32 3c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5Z" />
        <path d="M32 1v14M27 8H10M37 8h17" />
        <path d="M10 8c-2-2-4-2-6 0 2 2 4 2 6 0ZM54 8c2-2 4-2 6 0-2 2-4 2-6 0Z" />
      </g>
      <circle cx="32" cy="8" r="1.6" fill="currentColor" />
    </svg>
  );
}

/* the house mark: a quill in an inkwell. sits inside the wax seal. */
export function Quill({ className, size = 18 }: P) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 3c-4 .6-8.5 3.4-11 7.4-1 1.6-1.6 3.3-1.8 5" />
        <path d="M20 3c.5 3.4-.4 6.5-2.2 8.6-1.3 1.5-3 2.3-4.6 2.2" />
        <path d="M7.2 15.4 4.6 20.4" />
        <path d="M9.6 12.6c1.2.5 2.2 1.4 2.8 2.6" opacity=".55" />
      </g>
    </svg>
  );
}

/* theme toggle: a candle, lit at night */
export function Candle({ lit, className }: P & { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} aria-hidden="true">
      <g {...base}>
        <path d="M9 11h6v9H9z" />
        <path d="M7.5 20.5h9" />
        <path d="M12 11V9" />
        {lit ? (
          <path d="M12 8.6c1.7-1.2 1.9-3.2.6-4.6-.2 1-.8 1.5-1.5 1.8-.9.4-1.5 1.2-1.5 2.1 0 .9.7 1.6 1.6 1.6.3 0 .6-.3.8-.9Z" />
        ) : (
          <path d="M10.6 8.4c.5-.6 1.6-1.3 2.6-1" />
        )}
        <path d="M10 13.5v4M12.6 14.5v3" opacity=".5" />
      </g>
      {lit && <circle cx="11.8" cy="6.6" r="3.6" fill="currentColor" opacity=".13" />}
    </svg>
  );
}

/* golden snitch — margin plate */
export function Snitch({ className, size = 92 }: P) {
  return (
    <svg viewBox="0 0 120 80" width={size} height={size * 0.66} className={className} aria-hidden="true">
      <g {...base}>
        <circle cx="60" cy="42" r="15" />
        <path d="M45 42h30M60 27v30" opacity=".45" />
        <path d="M52 33c4 3 12 3 16 0M52 51c4-3 12-3 16 0" opacity=".45" />
        <path d="M45 38C34 26 20 22 8 26c8 6 10 14 8 22 9-2 17-4 27-2" />
        <path d="M75 38C86 26 100 22 112 26c-8 6-10 14-8 22-9-2-17-4-27-2" />
        <path d="M18 30c5 5 8 10 9 16M28 28c4 5 6 10 7 15" opacity=".35" />
        <path d="M102 30c-5 5-8 10-9 16M92 28c-4 5-6 10-7 15" opacity=".35" />
      </g>
    </svg>
  );
}

/* a grindylow in its tank — Lupin's office. margin plate */
export function Tank({ className, size = 92 }: P) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <g {...base}>
        <path d="M22 26h56v58H22z" />
        <path d="M18 26h64M20 84h60M22 38h56" opacity=".55" />
        <path d="M22 42c6 3 12-3 18 0s12 3 18 0 12-3 20 0" opacity=".4" />
        <circle cx="46" cy="56" r="7" />
        <circle cx="44" cy="54" r="1.4" fill="currentColor" />
        <path d="M53 56c6-2 10 1 13 5M53 60c5 2 8 6 9 11M46 63c-3 5-3 9-1 13M40 61c-4 3-7 7-8 12" />
        <path d="M30 48c2 0 3 1 3 3M66 44c2 0 3 1 3 3" opacity=".4" />
      </g>
    </svg>
  );
}

/* the moving staircase — the daily climb.
   five flights; `at` marks the one you are standing on. */
export function Staircase({ at, className }: { at: number; className?: string }) {
  const flights = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 240 400" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="stairfade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity=".28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* the tower shaft: hatched masonry behind the flights */}
      <g stroke="currentColor" strokeWidth="1" opacity=".14">
        {Array.from({ length: 13 }, (_, i) => (
          <path key={i} d={`M12 ${28 * i + 10}h216`} />
        ))}
        <path d="M12 10v380M228 10v380" />
      </g>

      {flights.map((f) => {
        const y = 348 - f * 72;                 // bottom flight first
        const dirRight = f % 2 === 0;
        const reached = f < at;
        const current = f === at;
        const x = dirRight ? 34 : 206;
        const sign = dirRight ? 1 : -1;
        const steps = 6;
        return (
          <g
            key={f}
            style={{
              transformOrigin: `${x}px ${y}px`,
              animation: current ? "sway 6s ease-in-out infinite" : undefined,
              opacity: reached || current ? 1 : 0.34,
            }}
          >
            {/* the flight itself, drawn as risers and treads */}
            <g
              fill="none"
              stroke={current ? "currentColor" : "url(#stairfade)"}
              strokeWidth={current ? 1.6 : 1.1}
              strokeLinejoin="round"
            >
              <path
                d={Array.from({ length: steps }, (_, s) => {
                  const sx = x + sign * s * 28;
                  const sy = y - s * 11;
                  return `M${sx} ${sy}h${sign * 28}v${-11}`;
                }).join(" ")}
              />
              {/* stringer + underside hatching */}
              <path d={`M${x} ${y}L${x + sign * steps * 28} ${y - steps * 11 + 6}`} opacity=".5" />
              {Array.from({ length: steps }, (_, s) => (
                <path
                  key={s}
                  d={`M${x + sign * s * 28} ${y - s * 11 + 2}l${sign * 7} 9`}
                  opacity=".25"
                />
              ))}
            </g>
            {/* landing seal */}
            <circle
              cx={x + sign * steps * 28}
              cy={y - steps * 11}
              r={current ? 5.5 : 3.5}
              fill={reached || current ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </g>
        );
      })}
    </svg>
  );
}
