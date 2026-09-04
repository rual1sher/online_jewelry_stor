// Панель бренда на странице входа всегда тёмная, независимо от темы приложения —
// поэтому цвет обводки граней фиксированный, а не токен --canvas.
export const GEM_PANEL_BG = '#15171a'

const FACET_COUNT = 16
const CENTER = 200
const OUTER_RADIUS = 170
const NOTCH_RADIUS = 154

// Небольшая случайность в радиусе через один шаг — чтобы грани читались как
// огранка драгоценного камня, а не как идеальный правильный многоугольник.
const OPACITY_STEPS = [1, 0.42, 0.72, 0.28, 0.85, 0.5]

function polarPoint(radius: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)]
}

const outerPoints = Array.from({ length: FACET_COUNT }, (_, i) => {
  const angle = (360 / FACET_COUNT) * i - 90
  const radius = i % 2 === 0 ? OUTER_RADIUS : NOTCH_RADIUS
  return polarPoint(radius, angle)
})

const facets = outerPoints.map((point, i) => {
  const next = outerPoints[(i + 1) % FACET_COUNT]
  return {
    points: `${CENTER},${CENTER} ${point[0]},${point[1]} ${next[0]},${next[1]}`,
    opacity: OPACITY_STEPS[i % OPACITY_STEPS.length],
  }
})

export function GemFacetPattern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="gem-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="url(#gem-glow)" />
      <g className="gem-rotor">
        {facets.map((facet) => (
          <polygon
            key={facet.points}
            points={facet.points}
            fill="var(--accent)"
            fillOpacity={facet.opacity}
            stroke={GEM_PANEL_BG}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        ))}
        <circle cx="200" cy="200" r="170" fill="none" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="60" fill="none" stroke={GEM_PANEL_BG} strokeOpacity="0.4" strokeWidth="1" />
      </g>
    </svg>
  )
}
