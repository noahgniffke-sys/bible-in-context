const THRESHOLD = 80
const CIRCLE_CIRCUMFERENCE = 100

export default function PullToRefreshIndicator({ pullDistance, refreshing }) {
  if (pullDistance === 0 && !refreshing) return null

  const progress = Math.min(pullDistance / THRESHOLD, 1)
  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress)
  const rotation = pullDistance * 2

  return (
    <div
      className="flex justify-center overflow-hidden"
      style={{
        height: pullDistance,
        transition: refreshing ? 'none' : pullDistance === 0 ? 'height 0.3s ease-out' : 'none',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          transform: refreshing ? undefined : `rotate(${rotation}deg)`,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 36 36"
          className={refreshing ? 'pull-refresh-spin' : ''}
        >
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-primary)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="var(--accent-secondary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={refreshing ? CIRCLE_CIRCUMFERENCE * 0.25 : dashOffset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
      </div>
    </div>
  )
}
