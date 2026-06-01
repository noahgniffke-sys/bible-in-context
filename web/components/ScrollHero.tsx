"use client";

import { useEffect, useRef, useState } from "react";
import { CAPTIONS, SCROLL_VH, SEQUENCE_DURATION } from "@/lib/content";

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const lastIdxRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const passed = -rect.top;
      const p = total > 0 ? Math.min(Math.max(passed / total, 0), 1) : 0;
      targetTimeRef.current = p * SEQUENCE_DURATION;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const target = targetTimeRef.current;
      currentTimeRef.current += (target - currentTimeRef.current) * 0.16;
      const t = Math.min(Math.max(currentTimeRef.current, 0), SEQUENCE_DURATION - 0.001);

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${t / SEQUENCE_DURATION})`;
      }

      let idx = 0;
      for (let i = 0; i < CAPTIONS.length; i++) {
        if (t >= CAPTIONS[i].start && t < CAPTIONS[i].end) {
          idx = i;
          break;
        }
        if (t >= CAPTIONS[i].end) idx = i;
      }
      if (idx !== lastIdxRef.current) {
        lastIdxRef.current = idx;
        setActiveIdx(idx);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={containerRef} style={{ height: `${SCROLL_VH}vh` }} className="relative">
      <div
        className="fixed left-0 right-0 h-[2px] z-30"
        style={{
          top: "max(env(safe-area-inset-top), 0px)",
          background: "color-mix(in oklab, var(--accent-primary) 18%, transparent)",
        }}
      >
        <div
          ref={progressBarRef}
          className="h-full origin-left"
          style={{
            background: "var(--accent-primary)",
            transform: "scaleX(0)",
            willChange: "transform",
          }}
        />
      </div>

      <div className="sticky top-0 h-screen flex items-center justify-center px-6">
        <div className="relative w-full max-w-3xl">
          {CAPTIONS.map((c, i) => (
            <div
              key={c.title}
              className={`absolute inset-x-0 top-1/2 -translate-y-1/2 transition-opacity duration-700 ${
                i === activeIdx ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{
                transform: `translateY(calc(-50% + ${(i - activeIdx) * 18}px))`,
                transition: "opacity 700ms ease, transform 700ms ease",
              }}
            >
              <div
                className="rounded-3xl px-7 py-8 sm:px-10 sm:py-10 backdrop-blur-md"
                style={{
                  background: "color-mix(in oklab, var(--bg-elevated) 65%, transparent)",
                  border: "1px solid var(--border-primary)",
                  boxShadow: "0 30px 80px -40px var(--accent-glow)",
                }}
              >
                <p
                  className="text-[10px] sm:text-xs uppercase tracking-[0.4em]"
                  style={{ color: "var(--gold-accent)" }}
                >
                  {String(i + 1).padStart(2, "0")} / {String(CAPTIONS.length).padStart(2, "0")}{" "}
                  &nbsp;·&nbsp; {c.eyebrow}
                </p>
                <h2
                  className="mt-3 font-serif font-medium leading-[1.05] tracking-tight"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(2rem, 5.5vw, 4rem)",
                    color: "var(--text-primary)",
                  }}
                >
                  {c.title}
                </h2>
                <p
                  className="mt-4 sm:mt-5 max-w-xl text-base sm:text-lg leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {c.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-12 left-0 right-0 flex justify-center">
        <div
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: "var(--text-muted)" }}
        >
          ↓ scroll
        </div>
      </div>
    </section>
  );
}
