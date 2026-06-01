export default function Intro() {
  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p
        className="text-[10px] sm:text-xs uppercase tracking-[0.5em] mb-8"
        style={{ color: "var(--gold-accent)" }}
      >
        Bible in Context
      </p>
      <h1
        className="font-serif font-medium leading-[0.95] tracking-tight"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(3rem, 10vw, 8rem)",
          color: "var(--text-primary)",
        }}
      >
        The Word,
        <br />
        <span style={{ color: "var(--accent-primary)" }}>in its full meaning.</span>
      </h1>
      <p
        className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        A Bible study app that gives you cross-references, original Greek and
        Hebrew, and verse-by-verse meaning — so Scripture is read the way it was
        written.
      </p>
      <div className="mt-14 flex flex-col items-center gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.5em]"
          style={{ color: "var(--text-muted)" }}
        >
          Scroll
        </span>
        <span style={{ color: "var(--gold-accent)" }}>↓</span>
      </div>
    </section>
  );
}
