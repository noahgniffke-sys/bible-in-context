// Drawn as SVG so iOS does not fall back to a boxed question mark for ✞.
export default function CrossMark({ className = '', size = 24 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M10.15 2.2h3.7v6.05h6.1v3.5h-6.1V21.8h-3.7v-10.05h-6.1v-3.5h6.1z"
      />
    </svg>
  )
}
