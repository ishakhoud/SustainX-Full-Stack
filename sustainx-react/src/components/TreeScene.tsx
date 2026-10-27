import { levelOf, stageOf } from '../data'

export default function TreeScene({ xp, burst }: { xp: number; burst: number }) {
  const lv = levelOf(xp)
  return (
    <div className="scene box">
      <span className="cap">Level {lv} · {stageOf(lv)}</span>
      <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <circle cx="60" cy="40" r="22" fill="#ffd45e" />
        <ellipse cx="300" cy="36" rx="34" ry="11" fill="#fff" />
        <ellipse cx="325" cy="46" rx="26" ry="9" fill="#fff" />
        <ellipse cx="110" cy="195" rx="210" ry="62" fill="#9be3b0" />
        <ellipse cx="310" cy="200" rx="190" ry="58" fill="#7fd69a" />
        <g id="tree" style={{ transform: `scale(${Math.min(0.45 + lv * 0.09, 1.15)})` }}>
          <rect x="194" y="100" width="12" height="52" rx="5" fill="#a0673c" />
          <circle cx="200" cy="88" r="34" fill="#3dbb6e" />
          <circle cx="172" cy="106" r="26" fill="#56d487" />
          <circle cx="228" cy="106" r="26" fill="#56d487" />
          {[[185, 84], [214, 96], [198, 114]].map(([x, y], i) => (
            <circle key={i} id={`a${i + 1}`} cx={x} cy={y} r="6" fill="#ff6b8b" style={{ opacity: lv >= 3 + i * 2 ? 1 : 0 }} />
          ))}
        </g>
      </svg>
      {burst > 0 && Array.from({ length: 8 }, (_, i) => (
        <span key={`${burst}-${i}`} className="lf" style={{ left: `${30 + ((i * 37) % 40)}%`, animationDelay: `${i * 0.05}s` }}>
          {['🍃', '🌿', '✨'][i % 3]}
        </span>
      ))}
    </div>
  )
}
