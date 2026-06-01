export default function CTA() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div
        className="max-w-3xl mx-auto rounded-3xl px-8 py-16 text-center"
        style={{
          background: "color-mix(in oklab, var(--bg-elevated) 70%, transparent)",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 40px 100px -50px var(--accent-glow)",
        }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.5em] mb-5"
          style={{ color: "var(--gold-accent)" }}
        >
          Coming to iOS
        </p>
        <h2
          className="font-serif font-medium leading-[1.05] tracking-tight"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            color: "var(--text-primary)",
          }}
        >
          The Word, in its full meaning.
        </h2>
        <p
          className="mt-6 text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Free forever. No ads. No subscriptions. Built so the Word of God can be
          actually understood.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://bible-in-context.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm uppercase tracking-[0.2em] transition"
            style={{
              background: "var(--accent-primary)",
              color: "#fff",
              boxShadow: "0 10px 30px -10px var(--accent-glow)",
            }}
          >
            Try the Web Version
          </a>
          <span
            className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm uppercase tracking-[0.2em]"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            iOS — coming soon
          </span>
        </div>
      </div>

      <footer
        className="mt-20 text-center text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <p>Bible in Context · Built for the church.</p>
      </footer>
    </section>
  );
}
