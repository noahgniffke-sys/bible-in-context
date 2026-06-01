import { FEATURES } from "@/lib/content";

export default function Features() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-[10px] uppercase tracking-[0.5em] mb-4"
            style={{ color: "var(--gold-accent)" }}
          >
            What's Inside
          </p>
          <h2
            className="font-serif font-medium leading-tight tracking-tight"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--text-primary)",
            }}
          >
            Built for serious study. Simple to use.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="rounded-2xl p-7 transition"
              style={{
                background: "color-mix(in oklab, var(--bg-card) 85%, transparent)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full mb-5 flex items-center justify-center"
                style={{
                  background: "color-mix(in oklab, var(--accent-primary) 15%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--accent-primary) 30%, transparent)",
                }}
              >
                <span style={{ color: "var(--gold-accent)" }}>✦</span>
              </div>
              <h3
                className="font-serif font-medium mb-2"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "var(--text-secondary)" }} className="leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
