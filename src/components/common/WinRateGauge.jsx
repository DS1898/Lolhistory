import { useApp } from '../../context/AppContext';

export default function WinRateGauge({ wins, total }) {
  const { t } = useApp();
  const rate = total > 0 ? (wins / total) * 100 : 0;

  const SIZE = 120;
  const cx = SIZE / 2;
  const cy = SIZE / 2 + 8;
  const R = 46;
  const START_ANGLE = 220;
  const TOTAL_ARC = 280;

  function polarToXY(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startDeg, endDeg, r) {
    const s = polarToXY(startDeg, r);
    const e = polarToXY(endDeg, r);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const filledDeg = (rate / 100) * TOTAL_ARC;
  const arcStart = START_ANGLE;
  const arcEnd = START_ANGLE + TOTAL_ARC;
  const fillEnd = START_ANGLE + filledDeg;

  const color = rate >= 60 ? '#4489c8' : rate <= 40 ? '#e84057' : '#8b8b9e';

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d={describeArc(arcStart, arcEnd, R)} fill="none" stroke="var(--border-clr)" strokeWidth="9" strokeLinecap="round" />
        {rate > 0 && (
          <path d={describeArc(arcStart, fillEnd, R)} fill="none" stroke="url(#gaugeGrad)" strokeWidth="9" strokeLinecap="round" />
        )}
        {rate > 2 && (() => {
          const tip = polarToXY(fillEnd, R);
          return <circle cx={tip.x} cy={tip.y} r="4.5" fill={color} />;
        })()}
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '88%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: color, lineHeight: 1 }}>
          {rate.toFixed(0)}%
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-mid)', marginTop: 2 }}>
          {t('total_games', { n: total })}
        </span>
      </div>
    </div>
  );
}
