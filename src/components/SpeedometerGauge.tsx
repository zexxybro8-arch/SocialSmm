import React, { useState, useEffect, useMemo } from 'react';

export type SpeedLevel = 'Slow' | 'Medium' | 'Fast' | 'Very Fast';

interface SpeedometerGaugeProps {
  speed?: string;
  speedTier?: 'Slow' | 'Medium' | 'Fast' | 'Very Fast';
  className?: string;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  speed = '1M per day',
  speedTier,
  className = '',
}) => {
  // Normalize speed tier dynamically
  const currentTier: SpeedLevel = useMemo(() => {
    if (speedTier) return speedTier;
    const raw = (speed || '').toLowerCase();
    if (raw.includes('very fast') || raw.includes('2m') || raw.includes('algorithm') || raw.includes('push')) {
      return 'Very Fast';
    }
    if (raw.includes('fast') || raw.includes('1m') || raw.includes('500k') || raw.includes('250k') || raw.includes('100k') || raw.includes('50k') || raw.includes('instant')) {
      return 'Fast';
    }
    if (raw.includes('medium') || raw.includes('5k') || raw.includes('10k') || raw.includes('15k') || raw.includes('1-2 hour')) {
      return 'Medium';
    }
    if (raw.includes('slow') || raw.includes('300') || raw.includes('1k') || raw.includes('organic')) {
      return 'Slow';
    }
    return 'Fast';
  }, [speed, speedTier]);

  // Speed Mapping according to specs:
  // Slow -> 25% (rotation -45 deg, 2/7 active segments)
  // Medium -> 50% (rotation 0 deg, 4/7 active segments)
  // Fast -> 75% (rotation +45 deg, 5/7 active segments)
  // Very Fast -> 90% (rotation +72 deg, 7/7 active segments)
  const { activeSegmentsCount, targetRotationDeg, tierDisplayName } = useMemo(() => {
    switch (currentTier) {
      case 'Slow':
        return {
          activeSegmentsCount: 2,
          targetRotationDeg: -45,
          tierDisplayName: 'Slow',
        };
      case 'Medium':
        return {
          activeSegmentsCount: 4,
          targetRotationDeg: 0,
          tierDisplayName: 'Medium',
        };
      case 'Fast':
        return {
          activeSegmentsCount: 5,
          targetRotationDeg: 45,
          tierDisplayName: 'Fast',
        };
      case 'Very Fast':
      default:
        return {
          activeSegmentsCount: 7,
          targetRotationDeg: 72,
          tierDisplayName: 'Very Fast',
        };
    }
  }, [currentTier]);

  // Animation states on mount
  const [animatedActiveCount, setAnimatedActiveCount] = useState<number>(0);
  const [animatedRotation, setAnimatedRotation] = useState<number>(-90); // starts at far left

  useEffect(() => {
    // Reset to start and animate smoothly to target
    const timer = setTimeout(() => {
      setAnimatedActiveCount(activeSegmentsCount);
      setAnimatedRotation(targetRotationDeg);
    }, 50);

    return () => clearTimeout(timer);
  }, [activeSegmentsCount, targetRotationDeg]);

  // Gauge Geometry:
  // ViewBox: 0 0 360 230
  // Center: (180, 190), Radius: 135
  const cx = 180;
  const cy = 190;
  const r = 135;
  const strokeWidth = 15;

  // 7 evenly distributed segments spanning a clean 180° semicircle from 180° (left) to 0° (right)
  // 7 segments, 6 gaps.
  const gapDeg = 4.5;
  const totalGapDeg = 6 * gapDeg; // 27°
  const segmentSpanDeg = (180 - totalGapDeg) / 7; // ~21.857°

  const segments = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const startDeg = 180 - i * (segmentSpanDeg + gapDeg);
      const endDeg = startDeg - segmentSpanDeg;

      const toRad = (d: number) => (d * Math.PI) / 180;
      const x1 = cx + r * Math.cos(toRad(startDeg));
      const y1 = cy - r * Math.sin(toRad(startDeg));
      const x2 = cx + r * Math.cos(toRad(endDeg));
      const y2 = cy - r * Math.sin(toRad(endDeg));

      // Symmetrical clockwise arc
      const d = `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;

      return {
        id: i,
        index: i + 1,
        d,
      };
    });
  }, [cx, cy, r, segmentSpanDeg, gapDeg]);

  return (
    <div
      className={`w-full max-w-[300px] mx-auto py-1 px-1 text-center overflow-visible select-none flex flex-col items-center justify-center ${className}`}
    >
      {/* Centered Speedometer SVG Container */}
      <div
        className="w-full max-w-[250px] sm:max-w-[270px] mx-auto relative flex items-center justify-center overflow-visible"
        style={{ aspectRatio: '360 / 230' }}
      >
        <svg
          viewBox="0 0 360 230"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Subtle emerald glow for active segments */}
            <filter id="gauge-green-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.45" />
            </filter>

            {/* Linear gradient along active segments */}
            <linearGradient id="gauge-green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Needle gradient */}
            <linearGradient id="gauge-needle-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>

            {/* Hub gradient */}
            <radialGradient id="gauge-hub-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#27272A" />
              <stop offset="100%" stopColor="#09090B" />
            </radialGradient>
          </defs>

          {/* Symmetrical 7 Segments */}
          {segments.map((seg) => {
            const isActive = seg.index <= animatedActiveCount;
            return (
              <path
                key={seg.id}
                d={seg.d}
                fill="none"
                stroke={isActive ? 'url(#gauge-green-gradient)' : '#27272A'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter={isActive ? 'url(#gauge-green-glow)' : undefined}
                className="transition-all duration-700 ease-out"
                opacity={isActive ? 1 : 0.45}
              />
            );
          })}

          {/* Center Text inside gauge and above the pivot */}
          <g className="text-center select-none pointer-events-none">
            <text
              x={cx}
              y={cy - 72}
              textAnchor="middle"
              className="fill-zinc-400 font-semibold tracking-widest uppercase"
              style={{
                fontSize: '12px',
                letterSpacing: '0.18em',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}
            >
              SPEED
            </text>
            <text
              x={cx}
              y={cy - 44}
              textAnchor="middle"
              className="fill-emerald-400 font-black tracking-tight"
              style={{
                fontSize: '22px',
                fontWeight: 900,
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {tierDisplayName}
            </text>
          </g>

          {/* Needle / Pointer Group anchored at exact center (cx, cy) */}
          <g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${animatedRotation}deg)`,
              transition: 'transform 900ms cubic-bezier(0.34, 1.4, 0.64, 1)',
            }}
          >
            {/* Elegant Needle pointing straight up at 0deg rotation, length: 104px (radius is 135px) */}
            <path
              d={`M ${cx - 3.5} ${cy} L ${cx - 0.8} ${cy - 102} Q ${cx} ${cy - 105} ${cx + 0.8} ${cy - 102} L ${cx + 3.5} ${cy} Z`}
              fill="url(#gauge-needle-gradient)"
              filter="url(#gauge-green-glow)"
            />

            {/* Center Pivot Outer Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={12}
              fill="url(#gauge-hub-gradient)"
              stroke="#3F3F46"
              strokeWidth={2}
            />

            {/* Center Inner Dot */}
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill="#10B981"
            />
          </g>
        </svg>
      </div>

      {/* Dynamic Estimated Throughput below the gauge */}
      <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-zinc-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50 inline-block animate-pulse" />
        <span>
          Estimated throughput: <strong className="text-white font-bold">{speed || '1M per day'}</strong>
        </span>
      </div>
    </div>
  );
};
