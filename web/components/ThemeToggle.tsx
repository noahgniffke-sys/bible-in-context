"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="fixed top-4 right-4 z-50 group"
      style={{
        width: 72,
        height: 36,
        borderRadius: 999,
        padding: 4,
        position: "fixed",
        background: "color-mix(in oklab, var(--bg-elevated) 85%, transparent)",
        border: "1px solid var(--border-primary)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px -12px var(--accent-glow)",
        cursor: "pointer",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 7px",
        }}
      >
        <span
          aria-hidden
          style={{
            fontSize: 12,
            color: isDark ? "var(--text-muted)" : "var(--gold-accent)",
            transition: "color 0.3s ease",
            zIndex: 1,
          }}
        >
          ☀
        </span>
        <span
          aria-hidden
          style={{
            fontSize: 12,
            color: isDark ? "var(--gold-accent)" : "var(--text-muted)",
            transition: "color 0.3s ease",
            zIndex: 1,
          }}
        >
          ☾
        </span>

        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: isDark ? "calc(100% - 26px)" : 0,
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "var(--accent-primary)",
            boxShadow: "0 4px 12px -2px var(--accent-glow)",
            transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease",
          }}
        />
      </div>
    </button>
  );
}
